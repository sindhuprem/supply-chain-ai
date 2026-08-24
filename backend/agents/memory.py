import os
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Initial seed memory precedents of historical supply chain disruptions & proven solutions
INITIAL_PRECEDENTS = [
    {
        "id": "prec_001",
        "disruption_type": "VEHICLE_BREAKDOWN",
        "description": "Engine failure on 10-ton refrigerated truck near NH-44 Pune corridor carrying cold-chain pharma",
        "resolution": "Reassigned order to Vanguard Logistics (Reliability 94%) & rerouted via SH-12 bypass.",
        "delay_minutes": 25,
        "success_score": 0.94,
        "key_takeaway": "Cold-chain items require alternate refrigerated transporter within 45 mins to prevent spoilage."
    },
    {
        "id": "prec_002",
        "disruption_type": "ROAD_BLOCKADE",
        "description": "Landslide/construction closure on Mumbai-Bengaluru Highway NH-48 sector 4",
        "resolution": "Applied OpenRouteService detour via Kolhapur-Belagavi outer ring road (+18 km distance).",
        "delay_minutes": 35,
        "success_score": 0.91,
        "key_takeaway": "Detour adding <20% distance is acceptable; notify retailer ETA update immediately."
    },
    {
        "id": "prec_003",
        "disruption_type": "ORDER_MODIFICATION",
        "description": "Destination changed mid-transit from Bengaluru Central Depot to Whitefield Warehouse",
        "resolution": "Recalculated drop-off point waypoint; updated driver route navigation directly.",
        "delay_minutes": 15,
        "success_score": 0.98,
        "key_takeaway": "Ensure destination geofence update is synced to retailer dashboard."
    }
]

class CognitiveMemoryStore:
    """
    Cognitive Memory Store leveraging vector search for past disruption precedents.
    Supports ChromaDB with in-memory vector/semantic search fallback.
    """
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self._init_memory()

    def _init_memory(self):
        try:
            import chromadb
            self.chroma_client = chromadb.Client()
            self.collection = self.chroma_client.get_or_create_collection(name="disruption_precedents")
            # Seed initial precedents if empty
            if self.collection.count() == 0:
                for p in INITIAL_PRECEDENTS:
                    self.collection.add(
                        ids=[p["id"]],
                        documents=[p["description"]],
                        metadatas=[{
                            "disruption_type": p["disruption_type"],
                            "resolution": p["resolution"],
                            "delay_minutes": p["delay_minutes"],
                            "success_score": p["success_score"],
                            "key_takeaway": p["key_takeaway"]
                        }]
                    )
            logger.info("ChromaDB Cognitive Memory initialized successfully.")
        except Exception as e:
            logger.warning(f"ChromaDB native binding fallback to internal cognitive memory engine: {e}")
            self.fallback_memory = INITIAL_PRECEDENTS

    def query_similar_precedents(self, query_text: str, disruption_type: str = "", top_k: int = 2) -> List[Dict[str, Any]]:
        results = []
        if self.collection:
            try:
                res = self.collection.query(query_texts=[query_text], n_results=top_k)
                if res and res.get("documents"):
                    docs = res["documents"][0]
                    metas = res["metadatas"][0]
                    for d, m in zip(docs, metas):
                        results.append({
                            "description": d,
                            "resolution": m.get("resolution", ""),
                            "delay_minutes": m.get("delay_minutes", 0),
                            "success_score": m.get("success_score", 0.9),
                            "key_takeaway": m.get("key_takeaway", "")
                        })
                    return results
            except Exception as ex:
                logger.error(f"Error querying ChromaDB: {ex}")

        # Fallback keyword/semantic match
        for item in INITIAL_PRECEDENTS:
            if disruption_type and item["disruption_type"] == disruption_type:
                results.append(item)
            elif any(w.lower() in item["description"].lower() for w in query_text.split() if len(w) > 3):
                results.append(item)
        
        return results[:top_k] if results else INITIAL_PRECEDENTS[:top_k]

    def store_outcome(self, disruption_type: str, description: str, resolution: str, success_score: float = 0.95):
        try:
            doc_id = f"prec_{os.urandom(4).hex()}"
            if self.collection:
                self.collection.add(
                    ids=[doc_id],
                    documents=[description],
                    metadatas=[{
                        "disruption_type": disruption_type,
                        "resolution": resolution,
                        "delay_minutes": 20,
                        "success_score": success_score,
                        "key_takeaway": "Validated response executed and confirmed by Critic Agent."
                    }]
                )
            INITIAL_PRECEDENTS.append({
                "id": doc_id,
                "disruption_type": disruption_type,
                "description": description,
                "resolution": resolution,
                "delay_minutes": 20,
                "success_score": success_score,
                "key_takeaway": "Validated response executed and confirmed by Critic Agent."
            })
            logger.info(f"Learned and saved new cognitive memory precedent: {doc_id}")
        except Exception as e:
            logger.error(f"Failed to save cognitive outcome: {e}")

memory_store = CognitiveMemoryStore()
