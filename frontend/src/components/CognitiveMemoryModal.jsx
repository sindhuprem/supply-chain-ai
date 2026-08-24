import React, { useState, useEffect } from 'react';
import { X, Database, Search, Award, BookOpen, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function CognitiveMemoryModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('vehicle breakdown roadblock');
  const [precedents, setPrecedents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchMemory();
  }, [isOpen]);

  const fetchMemory = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8000/api/disruptions/cognitive-memory/?query=${encodeURIComponent(query)}`);
      setPrecedents(resp.data.precedents || []);
    } catch (err) {
      console.error("Failed to query memory store:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">ChromaDB Cognitive Memory Inspector</h2>
            <p className="text-xs text-slate-400">Vector embedding memory of past disruption resolutions & success scores</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query semantic memory..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={fetchMemory}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            Query Vector Store
          </button>
        </div>

        {/* Precedents List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Querying ChromaDB vector index...</div>
          ) : precedents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No memory precedents found for this query.</div>
          ) : (
            precedents.map((item, idx) => (
              <div key={idx} className="glass-card rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white">{item.disruption_type || "Disruption Precedent"}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold">
                    Success Score: {int(item.success_score * 100)}%
                  </span>
                </div>

                <p className="text-xs text-slate-300"><span className="text-slate-500 font-semibold">Signal:</span> {item.description}</p>
                <p className="text-xs text-cyan-300"><span className="text-slate-500 font-semibold">Resolution Applied:</span> {item.resolution}</p>

                {item.key_takeaway && (
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-amber-200/90 flex items-start space-x-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong className="text-amber-400">Key Cognitive Lesson:</strong> {item.key_takeaway}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function int(val) {
  return Math.round((val || 0.9) * 100);
}
