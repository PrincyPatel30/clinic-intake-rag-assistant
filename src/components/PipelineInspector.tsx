import React, { useState } from 'react';
import {
  Search,
  Play,
  Activity,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BarChart2,
  FileCode,
  Check,
  Filter,
} from 'lucide-react';
import { CandidateScore, RetrievalTrace } from '../types';
import { CLINICAL_CHUNKS } from '../data/protocols';
import { inspectRetrieval } from '../lib/ragEngine';
import { evaluateRedFlags } from '../lib/safetyGuards';
import { deidentifyText } from '../lib/deidentifier';

interface PipelineInspectorProps {
  traces: RetrievalTrace[];
}

export const PipelineInspector: React.FC<PipelineInspectorProps> = ({ traces }) => {
  const [testQuery, setTestQuery] = useState(
    'Whenever I climb the stairs my chest feels tight and heavy, but resting helps.'
  );
  const [candidates, setCandidates] = useState<CandidateScore[]>([]);
  const [playgroundRedFlag, setPlaygroundRedFlag] = useState<any>(null);
  const [deidentifiedResult, setDeidentifiedResult] = useState<any>(null);
  const [hasRunPlayground, setHasRunPlayground] = useState(false);

  // Eval State
  const [evalSummary, setEvalSummary] = useState<any>(null);
  const [evalResults, setEvalResults] = useState<any[]>([]);
  const [isRunningEval, setIsRunningEval] = useState(false);

  const sampleQueries = [
    { label: 'Exertional Angina', text: 'Whenever I climb the stairs my chest feels tight and heavy, but resting helps.' },
    { label: 'Radiation to Arm', text: 'Pain starts in my chest and shoots down my left arm and neck.' },
    { label: 'Exact Medication', text: 'I take Metoprolol Tartrate 50mg twice a day.' },
    { label: 'Negation Test', text: 'I am NOT taking any blood thinners or prescription heart pills.' },
    { label: 'Orthopnea (Pillows)', text: 'I have to sleep propped up on 3 pillows or I cannot breathe.' },
    { label: '🚨 Red-Flag Emergency', text: 'Crushing chest pain radiating to my left arm and jaw.' },
  ];

  const handleRunPlayground = async (queryText: string) => {
    // Red-flag and de-identification stages are deterministic and stay local.
    const rf = evaluateRedFlags(queryText);
    const deid = deidentifyText(queryText);

    setPlaygroundRedFlag(rf);
    setDeidentifiedResult(deid);
    setHasRunPlayground(true);

    // Retrieval runs server-side: it embeds the query with Gemini and searches
    // pgvector, so it cannot run in the browser without exposing the API key.
    try {
      const ret = await inspectRetrieval(deid.scrubbedText);
      setCandidates(ret.candidates);
    } catch (e) {
      console.error('Retrieval inspection failed:', e);
      setCandidates([]);
    }
  };

  const handleRunBenchmark = async () => {
    setIsRunningEval(true);
    try {
      const res = await fetch('/api/eval/run', { method: 'POST' });
      const data = await res.json();
      setEvalSummary(data.summary);
      setEvalResults(data.results);
    } catch (e) {
      console.error('Eval run error:', e);
    } finally {
      setIsRunningEval(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              Developer & Evaluation Suite
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300">Deterministic RAG Lab</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Pipeline Inspector & Retrieval Playground
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Transparently inspect BM25 sparse scores, dense vector embeddings, Reciprocal Rank Fusion (k=60), and safety guards.
          </p>
        </div>

        <button
          type="button"
          disabled={isRunningEval}
          onClick={handleRunBenchmark}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition shadow-sm disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {isRunningEval ? 'Running 30 Benchmark Cases...' : 'Run 30-Item Retrieval Eval'}
        </button>
      </div>

      {/* SECTION 1: LIVE RETRIEVAL PLAYGROUND */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Live RAG Retrieval Playground
            </h2>
          </div>
          <span className="text-xs text-slate-700 dark:text-slate-300">Test any patient utterance</span>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Quick Test Cases:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setTestQuery(sq.text);
                handleRunPlayground(sq.text);
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500 transition"
            >
              {sq.label}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Enter test patient utterance..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={() => handleRunPlayground(testQuery)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Inspect Ranking
          </button>
        </div>

        {/* Playground Results */}
        {hasRunPlayground && (
          <div className="space-y-4 pt-2">
            {/* Safety & De-id Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  playgroundRedFlag.hasRedFlag
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                {playgroundRedFlag.hasRedFlag ? (
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    Deterministic Safety Check:{' '}
                    {playgroundRedFlag.hasRedFlag ? 'EMERGENCY RED-FLAG TRIGGERED' : 'PASSED (Safe)'}
                  </div>
                  {playgroundRedFlag.hasRedFlag && (
                    <div className="mt-1 text-[11px] text-red-800 dark:text-red-300">
                      Rule: {playgroundRedFlag.matchedRule} — "{playgroundRedFlag.detectedPhrase}"
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  De-identified Outbound Payload (HIPAA Safe Harbor)
                </div>
                <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                  "{deidentifiedResult?.scrubbedText}"
                </div>
              </div>
            </div>

            {/* Candidates Ranking Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Final Rank</th>
                    <th className="py-2.5 px-3">Chunk ID</th>
                    <th className="py-2.5 px-3">Section</th>
                    <th className="py-2.5 px-3 text-right">BM25 (Sparse)</th>
                    <th className="py-2.5 px-3 text-right">Dense (Vector)</th>
                    <th className="py-2.5 px-3 text-right">RRF (k=60)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {candidates.map((cand, idx) => {
                    const isTop = idx === 0;
                    return (
                      <tr
                        key={cand.chunkId}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-850/50 transition ${
                          isTop ? 'bg-teal-50/40 dark:bg-teal-950/20 font-medium' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono">
                          {isTop ? (
                            <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 font-bold">
                              ★ #1
                            </span>
                          ) : (
                            `#${cand.finalRank}`
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{cand.chunkId}</td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-slate-800 dark:text-slate-200">
                          {cand.section}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {cand.bm25Score}{' '}
                          <span className="text-[10px] text-slate-400">(Rank {cand.bm25Rank})</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {cand.denseScore}{' '}
                          <span className="text-[10px] text-slate-400">(Rank {cand.denseRank})</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-teal-700 dark:text-teal-300 font-semibold">
                          {cand.rrfScore}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isTop ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                              CHOSEN NEXT
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Ranked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: DETERMINISTIC BENCHMARK EVALUATION (Section 8a of Brief) */}
      {evalSummary && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Deterministic Retrieval Evaluation Report (30 Hand-labeled Utterances)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
              Evaluated {evalSummary.evaluatedItems} of {evalSummary.totalItems} test queries
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300">
            Measures Hit@1, Hit@3, and Mean Reciprocal Rank (MRR) across all pipeline stages.
            Includes adversarial negation tests, numeric severity constraints, exact drug names, and misspellings.
          </p>

          {/* Metrics Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Pipeline Configuration</th>
                  <th className="py-3 px-4 text-center">Hit@1 (Top Choice)</th>
                  <th className="py-3 px-4 text-center">Hit@3 (Top 3)</th>
                  <th className="py-3 px-4 text-center">MRR (Mean Reciprocal Rank)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Dense Vector Only</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                    {evalSummary.denseOnly.hit1}%
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                    {evalSummary.denseOnly.hit3}%
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                    {evalSummary.denseOnly.mrr}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">BM25 Sparse Only</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                    {evalSummary.bm25Only.hit1}%
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                    {evalSummary.bm25Only.hit3}%
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                    {evalSummary.bm25Only.mrr}
                  </td>
                </tr>
                <tr className="bg-teal-50/40 dark:bg-teal-950/20 font-medium">
                  <td className="py-3 px-4 text-teal-900 dark:text-teal-200 font-semibold">
                    ★ Hybrid Search (RRF k=60)
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-teal-800 dark:text-teal-300">
                    {evalSummary.hybridRRF.hit1}%
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-teal-800 dark:text-teal-300">
                    {evalSummary.hybridRRF.hit3}%
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-teal-800 dark:text-teal-300">
                    {evalSummary.hybridRRF.mrr}
                  </td>
                </tr>
                <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 font-medium">
                  <td className="py-3 px-4 text-emerald-900 dark:text-emerald-200 font-semibold">
                    ★ Hybrid RRF + Contextual Sentences
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    {evalSummary.hybridRRFWithContextual.hit1}%
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    {evalSummary.hybridRRFWithContextual.hit3}%
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    {evalSummary.hybridRRFWithContextual.mrr}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sample Benchmark Queries Detail */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Adversarial Query Breakdown:
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {evalResults.slice(0, 10).map((er) => (
                <div
                  key={er.id}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {er.id}
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">"{er.query}"</span>
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300">
                      Category: {er.category} • Target: {er.expectedChunkId}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      RRF Rank: <span className="font-bold text-slate-800 dark:text-slate-200">#{er.rrfRank}</span>
                    </span>
                    {er.isHit1 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Hit@1
                      </span>
                    ) : er.isHit3 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        Hit@3
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Rank #{er.rrfRank}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TURN TRACES & LATENCY WATERFALL */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Turn Traces & Latency Breakdown
            </h2>
          </div>
          <span className="text-xs text-slate-700 dark:text-slate-300">{traces.length} Total Turn Traces Recorded</span>
        </div>

        {traces.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-700 dark:text-slate-300">
            No turn traces recorded yet. Send a message in the Patient View or test a query in the playground above.
          </div>
        ) : (
          <div className="space-y-3">
            {traces.slice(-3).reverse().map((tr) => (
              <div
                key={tr.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">Turn #{tr.turnNumber}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{tr.id}</span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">
                    Total Time: <span className="font-mono font-bold text-teal-600">{tr.latency.totalMs}ms</span>
                  </span>
                </div>

                <div className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Patient Input: </span>
                  "{tr.rawUtterance}"
                </div>

                {/* Waterfall Stage Latencies */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="text-slate-700 dark:text-slate-300">1. Safety Guard</div>
                    <div className="font-mono font-semibold text-slate-900 dark:text-white">
                      {tr.latency.safetyGuardMs}ms
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="text-slate-700 dark:text-slate-300">2. De-identification</div>
                    <div className="font-mono font-semibold text-slate-900 dark:text-white">
                      {tr.latency.deidentificationMs}ms
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="text-slate-700 dark:text-slate-300">3. Hybrid RAG (RRF)</div>
                    <div className="font-mono font-semibold text-slate-900 dark:text-white">
                      {tr.latency.retrievalMs}ms
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="text-slate-700 dark:text-slate-300">4. Gemini Flash 3.8</div>
                    <div className="font-mono font-semibold text-slate-900 dark:text-white">
                      {tr.latency.geminiExtractionMs}ms
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: PROTOCOL CHUNKS CATALOG */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Indexed Clinical Protocol Chunks & Contextual Sentences
            </h2>
          </div>
          <span className="text-xs text-slate-700 dark:text-slate-300">{CLINICAL_CHUNKS.length} Clinical Unit Chunks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {CLINICAL_CHUNKS.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{c.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {c.specialty}
                </span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">{c.section}</div>
              <div className="text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                Context: "{c.contextSentence}"
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                Question: <span className="font-medium text-slate-800 dark:text-slate-200">{c.questionText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
