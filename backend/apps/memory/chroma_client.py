import os
import uuid
import math
import logging
from datetime import datetime, timezone
from django.conf import settings
from django.db.models import F

logger = logging.getLogger(__name__)

# Fallback lightweight embedding generator if SentenceTransformer model is loading
class DummyEncoder:
    def encode(self, text):
        import hashlib
        # Generate deterministic 384-dim pseudo-random vector based on string hash
        seed = int(hashlib.md5(text.encode('utf-8')).hexdigest(), 16)
        import random
        rng = random.Random(seed)
        vec = [rng.uniform(-1.0, 1.0) for _ in range(384)]
        norm = math.sqrt(sum(x*x for x in vec))
        return [x/norm for x in vec]

embedding_model = None
try:
    from sentence_transformers import SentenceTransformer
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    logger.warning(f"SentenceTransformer fallback to deterministic encoder: {e}")
    embedding_model = DummyEncoder()

# ChromaDB Initialization
collection = None
try:
    import chromadb
    CHROMA_PATH = getattr(settings, 'CHROMA_PERSIST_PATH', os.path.join(settings.BASE_DIR, 'chroma_db'))
    os.makedirs(CHROMA_PATH, exist_ok=True)
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_or_create_collection(
        name="disruption_memory",
        metadata={"hnsw:space": "cosine"}
    )
except Exception as e:
    logger.warning(f"ChromaDB persistent client init warning: {e}")

def write_disruption_to_memory(disruption_event, outcome):
    """
    Converts a resolved disruption into an embedding and stores it in ChromaDB and SQLite.
    This is how the multi-agent system learns from past experience.
    """
    from .models import CognitiveMemoryRecord

    embedded_text = f"""
    Disruption type: {disruption_event.disruption_type}
    Severity: {disruption_event.severity}
    Location: {disruption_event.location_name or 'Expressway'}
    Description: {disruption_event.description or 'Route obstacle reported.'}
    Remaining stops: {disruption_event.remaining_waypoints_json}
    Resolution: {outcome.get('resolution_approach', 'Rerouted via alternate highway bypass')}
    Outcome: {outcome.get('result', 'success')}
    Delay caused: {outcome.get('delay_mins', 15.0)} minutes
    Transporter performance score: {outcome.get('transporter_score', 9.2)}
    """

    embedding = embedding_model.encode(embedded_text)
    if hasattr(embedding, 'tolist'):
        embedding = embedding.tolist()

    memory_id = str(uuid.uuid4())
    reported_iso = disruption_event.reported_at.isoformat() if disruption_event.reported_at else datetime.now(timezone.utc).isoformat()

    metadata = {
        "disruption_type": str(disruption_event.disruption_type),
        "severity": str(disruption_event.severity),
        "location_region": str(disruption_event.location_name or 'Expressway'),
        "resolution_approach": str(outcome.get('resolution_approach', 'Rerouted via alternate bypass')),
        "outcome": str(outcome.get('result', 'success')),
        "delay_mins": float(outcome.get('delay_mins', 15.0)),
        "agent_confidence": float(outcome.get('agent_confidence', 0.92)),
        "timestamp": reported_iso
    }

    if collection is not None:
        try:
            collection.add(
                ids=[memory_id],
                embeddings=[embedding],
                documents=[embedded_text],
                metadatas=[metadata]
            )
        except Exception as err:
            logger.warning(f"ChromaDB add error: {err}")

    record = CognitiveMemoryRecord.objects.create(
        disruption=disruption_event,
        chroma_vector_id=memory_id,
        embedded_text=embedded_text,
        disruption_type=disruption_event.disruption_type,
        severity=disruption_event.severity,
        location_region=disruption_event.location_name or 'Expressway',
        resolution_approach=outcome.get('resolution_approach', 'Rerouted via alternate bypass'),
        outcome=outcome.get('result', CognitiveMemoryRecord.OUTCOME_SUCCESS),
        delay_mins=outcome.get('delay_mins', 15.0),
        agent_confidence=outcome.get('agent_confidence', 0.92)
    )
    return memory_id


def retrieve_similar_disruptions(query_disruption, top_k=5):
    """
    Retrieves past similar disruptions using composite confidence-weighted scoring:
    Confidence = SemanticSimilarity * TemporalDecay * GeographicRelevance * OutcomeQuality
    """
    from .models import CognitiveMemoryRecord

    query_text = f"""
    Disruption type: {query_disruption.get('type', 'road_block')}
    Severity: {query_disruption.get('severity', 'high')}
    Location: {query_disruption.get('location', 'NH-48')}
    Description: {query_disruption.get('description', '')}
    """

    query_embedding = embedding_model.encode(query_text)
    if hasattr(query_embedding, 'tolist'):
        query_embedding = query_embedding.tolist()

    db_records = list(CognitiveMemoryRecord.objects.all())
    if not db_records:
        return []

    # Query ChromaDB if collection available
    chroma_results = None
    if collection is not None and collection.count() > 0:
        try:
            chroma_results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(20, collection.count()),
                include=['documents', 'metadatas', 'distances']
            )
        except Exception as e:
            logger.warning(f"ChromaDB query fallback: {e}")

    scored_memories = []
    now = datetime.now(timezone.utc)

    if chroma_results and chroma_results.get('ids') and chroma_results['ids'][0]:
        for i, memory_id in enumerate(chroma_results['ids'][0]):
            meta = chroma_results['metadatas'][0][i]
            doc = chroma_results['documents'][0][i]
            distance = chroma_results['distances'][0][i]
            semantic_score = max(0.0, 1.0 - distance)

            # Weight 1: Temporal decay
            try:
                mem_date = datetime.fromisoformat(meta.get('timestamp', now.isoformat()))
                if mem_date.tzinfo is None:
                    mem_date = mem_date.replace(tzinfo=timezone.utc)
                days_old = max(0, (now - mem_date).days)
            except Exception:
                days_old = 0
            temporal_weight = math.exp(-0.02 * days_old)

            # Weight 2: Geographic relevance
            target_loc = str(query_disruption.get('location', '')).lower()
            mem_loc = str(meta.get('location_region', '')).lower()
            geographic_weight = 1.2 if (target_loc and target_loc in mem_loc) else 0.8

            # Weight 3: Outcome quality
            outcome_weight = {
                'success': 1.3,
                'delayed': 0.9,
                'failed': 0.5,
                'escalated': 0.4
            }.get(meta.get('outcome', 'success'), 1.0)

            confidence_score = semantic_score * temporal_weight * geographic_weight * outcome_weight

            scored_memories.append({
                'memory_id': memory_id,
                'document': doc,
                'metadata': meta,
                'semantic_score': round(semantic_score, 4),
                'confidence_score': round(confidence_score, 4),
            })
    else:
        # Fallback scoring over Django database records if vector store is initializing
        for rec in db_records:
            semantic_score = 0.85
            days_old = max(0, (now - rec.created_at).days)
            temporal_weight = math.exp(-0.02 * days_old)
            target_loc = str(query_disruption.get('location', '')).lower()
            mem_loc = str(rec.location_region or '').lower()
            geographic_weight = 1.2 if (target_loc and target_loc in mem_loc) else 0.8
            outcome_weight = {'success': 1.3, 'delayed': 0.9, 'failed': 0.5, 'escalated': 0.4}.get(rec.outcome, 1.0)
            confidence_score = semantic_score * temporal_weight * geographic_weight * outcome_weight

            scored_memories.append({
                'memory_id': rec.chroma_vector_id,
                'document': rec.embedded_text,
                'metadata': {
                    'disruption_type': rec.disruption_type,
                    'severity': rec.severity,
                    'location_region': rec.location_region,
                    'resolution_approach': rec.resolution_approach,
                    'outcome': rec.outcome,
                    'delay_mins': rec.delay_mins,
                    'agent_confidence': rec.agent_confidence,
                    'timestamp': rec.created_at.isoformat()
                },
                'semantic_score': round(semantic_score, 4),
                'confidence_score': round(confidence_score, 4),
            })

    scored_memories.sort(key=lambda x: x['confidence_score'], reverse=True)

    retrieved_ids = [m['memory_id'] for m in scored_memories[:top_k]]
    CognitiveMemoryRecord.objects.filter(chroma_vector_id__in=retrieved_ids).update(retrieval_count=F('retrieval_count') + 1)

    return scored_memories[:top_k]
