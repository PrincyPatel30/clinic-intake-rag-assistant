import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';

// Lucide Icons
import {
  Code,
  BookOpen,
  Sliders,
  Download,
  Play,
  Layers,
  FileCode,
  Sparkles,
  Flame,
} from 'lucide-react';

import { CustomRAGPipeline, PipelineExecutionResult } from '../lib/customPipeline';

export const PipelineNotebookStudioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Pipeline Interactive Test State
  const [testQuery, setTestQuery] = useState<string>(
    'my back tooth is coming through sideways and keeps getting infected'
  );
  const [temperature, setTemperature] = useState<number>(0.2);
  const [topK, setTopK] = useState<number>(3);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineExecutionResult | null>(null);

  useEffect(() => {
    handleRunPipeline();
  }, []);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    try {
      const pipeline = new CustomRAGPipeline({ temperature, topK });
      const result = await pipeline.execute(testQuery, temperature);
      setPipelineResult(result);
    } catch (err) {
      console.error('Failed to run custom pipeline:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownloadNotebook = () => {
    window.location.href = '/api/pipeline/download-notebook';
  };

  const getTemperatureDescription = (temp: number) => {
    if (temp <= 0.2) {
      return 'Deterministic & Clinical Protocol Adherent (Recommended for medical intake)';
    } else if (temp <= 0.5) {
      return 'Balanced: Focused fact retrieval with gentle conversational transitions';
    } else {
      return 'Creative & Conversational: Highest empathy, broader phrasing variety';
    }
  };

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', pb: 8 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.3)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box sx={{ maxWidth: 820 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Layers size={24} color="#ffffff" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>
                RAG Pipeline Studio & Jupyter Notebook (.ipynb)
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Implementation matching the <strong>LangChain RAG Course Playlist</strong>. Here your{' '}
              <strong>custom pipeline</strong>, <strong>temperature hyperparameter</strong>, and{' '}
              <strong>Jupyter Notebook (.ipynb)</strong> are separated, inspectable, and interactive.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleDownloadNotebook}
            startIcon={<Download size={18} />}
            sx={{
              bgcolor: '#ffffff',
              color: '#0f766e',
              fontWeight: 800,
              textTransform: 'none',
              px: 2.5,
              py: 1.2,
              borderRadius: 2.5,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: '#f0fdfa' },
            }}
          >
            Download .ipynb File
          </Button>
        </Box>

        {/* 4 Architectural Answers Pill Bar */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 1.5,
            mt: 3,
            pt: 2.5,
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', fontWeight: 700 }}>
              1. CUSTOM PIPELINE:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              /backend/.../custom_pipeline.py
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.72rem' }}>
              & src/lib/customPipeline.ts
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', fontWeight: 700 }}>
              2. TEMPERATURE PARAMETER:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Flame size={16} /> Current: {temperature.toFixed(2)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.72rem' }}>
              Tunable from 0.0 to 1.0
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', fontWeight: 700 }}>
              3. NOTEBOOK FILE:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              rag_chatbot_pipeline.ipynb
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.72rem' }}>
              Root & /backend folder
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', fontWeight: 700 }}>
              4. ARCHITECTURE:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              Separated & Modular
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.72rem' }}>
              LCEL: Retriever → Prompt → LLM
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs Navigation */}
      <Paper elevation={0} sx={{ borderRadius: 3, mb: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, '& .MuiTab-root': { py: 1.8, fontWeight: 800, textTransform: 'none' } }}
        >
          <Tab icon={<Sliders size={18} />} iconPosition="start" label="Interactive Custom Pipeline & Temperature" />
          <Tab icon={<BookOpen size={18} />} iconPosition="start" label="Jupyter Notebook Viewer (.ipynb)" />
          <Tab icon={<FileCode size={18} />} iconPosition="start" label="Python: custom_pipeline.py" />
          <Tab icon={<Code size={18} />} iconPosition="start" label="TypeScript: customPipeline.ts" />
        </Tabs>
      </Paper>

      {/* TAB 0: INTERACTIVE CUSTOM PIPELINE & TEMPERATURE */}
      {activeTab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 3 }}>
          {/* Left Column: Input & Temperature Controls */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1.5px solid #e2e8f0', bgcolor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Sliders size={20} color="#0f766e" />
              Pipeline Hyperparameters
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              Configure the model temperature and retrieval depth for the custom RAG chain.
            </Typography>

            {/* Temperature Control Slider */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Flame size={18} color="#0f766e" />
                  Temperature: <strong>{temperature.toFixed(2)}</strong>
                </Typography>
                <Chip
                  label={temperature <= 0.2 ? 'Deterministic' : temperature <= 0.5 ? 'Balanced' : 'Creative'}
                  size="small"
                  sx={{
                    bgcolor: temperature <= 0.2 ? '#ccfbf1' : temperature <= 0.5 ? '#e0f2fe' : '#fef3c7',
                    color: temperature <= 0.2 ? '#0f766e' : temperature <= 0.5 ? '#0369a1' : '#b45309',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>

              <Slider
                value={temperature}
                min={0.0}
                max={1.0}
                step={0.05}
                onChange={(_, val) => setTemperature(val as number)}
                valueLabelDisplay="auto"
                sx={{ color: '#0f766e' }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', mt: -0.5 }}>
                <span>0.0 (Strict Protocol)</span>
                <span>0.2 (Clinical Ideal)</span>
                <span>1.0 (High Creative)</span>
              </Box>

              <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#475569', lineHeight: 1.4 }}>
                <strong>Effect:</strong> {getTemperatureDescription(temperature)}
              </Typography>
            </Box>

            {/* Top-K Chunks */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                  Top-K Context Chunks: <strong>{topK}</strong>
                </Typography>
              </Box>
              <Slider
                value={topK}
                min={1}
                max={6}
                step={1}
                onChange={(_, val) => setTopK(val as number)}
                valueLabelDisplay="auto"
                sx={{ color: '#0f766e' }}
              />
            </Box>

            {/* Patient Query Input */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Patient Utterance / Symptom Query:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter a symptom or health concern..."
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />

            {/* Quick Preset Buttons */}
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
              Quick Test Queries:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
              {[
                'My lower wisdom tooth is throbbing and swollen',
                'Crushing chest pressure radiating to my left arm',
                'Severe headache like a sudden thunderclap',
                'Shortness of breath requiring 3 pillows to sleep',
              ].map((preset, idx) => (
                <Chip
                  key={idx}
                  label={preset}
                  size="small"
                  onClick={() => setTestQuery(preset)}
                  sx={{
                    cursor: 'pointer',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    bgcolor: '#f1f5f9',
                    '&:hover': { bgcolor: '#e2e8f0' },
                  }}
                />
              ))}
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={isRunning}
              onClick={handleRunPipeline}
              startIcon={isRunning ? <CircularProgress size={18} color="inherit" /> : <Play size={18} />}
              sx={{
                bgcolor: '#0f766e',
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: 2.5,
                py: 1.2,
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                '&:hover': { bgcolor: '#0d9488' },
              }}
            >
              {isRunning ? 'Running Custom Pipeline...' : 'Run Custom Pipeline'}
            </Button>
          </Paper>

          {/* Right Column: Execution Output & Trace */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {pipelineResult && (
              <>
                {/* Generated Answer Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: pipelineResult.isRedFlag ? '#ef4444' : '#0f766e',
                    bgcolor: 'white',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Sparkles size={20} color={pipelineResult.isRedFlag ? '#ef4444' : '#0f766e'} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Pipeline Synthesized Response
                      </Typography>
                    </Box>
                    <Chip
                      label={`Temp: ${pipelineResult.temperature}`}
                      size="small"
                      sx={{ bgcolor: '#f0fdfa', color: '#0f766e', fontWeight: 800 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: pipelineResult.isRedFlag ? '#fef2f2' : '#f0fdfa',
                      color: pipelineResult.isRedFlag ? '#991b1b' : '#134e4a',
                      border: '1px solid',
                      borderColor: pipelineResult.isRedFlag ? '#fecaca' : '#ccfbf1',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {pipelineResult.generatedAnswer}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Retrieval Latency: <strong>{pipelineResult.executionMetrics.retrievalMs}ms</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Safety Check: <strong>{pipelineResult.executionMetrics.safetyMs}ms</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Total Pipeline: <strong>{pipelineResult.executionMetrics.totalMs}ms</strong>
                    </Typography>
                  </Box>
                </Paper>

                {/* Retrieved Context Chunks */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                    Retrieved Context Chunks (Top-{pipelineResult.retrievedContext.length}):
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {pipelineResult.retrievedContext.map((chunk, index) => (
                      <Box
                        key={chunk.chunkId}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f766e' }}>
                            [#{index + 1}] {chunk.chunkId} ({chunk.section})
                          </Typography>
                          <Chip
                            label={`RRF Score: ${(chunk.rrfScore * 100).toFixed(1)}%`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                          "{chunk.questionText}"
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                {/* Assembled Prompt Template */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                    Assembled Prompt Template (with Temperature Constraint):
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: '#0f172a',
                      color: '#a7f3d0',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 240,
                    }}
                  >
                    {pipelineResult.promptTemplate}
                  </Box>
                </Paper>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* TAB 1: JUPYTER NOTEBOOK VIEWER (.ipynb) */}
      {activeTab === 1 && (
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3.5 }, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Jupyter Notebook: rag_chatbot_pipeline.ipynb
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Follows step-by-step from the LangChain RAG Course tutorial.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleDownloadNotebook}
              startIcon={<Download size={18} />}
              sx={{ bgcolor: '#0f766e', fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
            >
              Download .ipynb File
            </Button>
          </Box>

          {/* Cell by Cell Display */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Cell 1: Overview */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
              <Chip label="Markdown Cell [1]" size="small" sx={{ mb: 1, fontWeight: 700 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f766e' }}>
                Production RAG Chatbot with Custom Pipeline & Temperature Control
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mt: 1 }}>
                Reference: <strong>LangChain RAG Course: From Basics to Production-Ready RAG Chatbot</strong>
                <br />
                This notebook demonstrates modular decoupling of Document Ingestion, Recursive Chunking, Vector Storage,
                Prompt Templates, Temperature Hyperparameter configuration, and LCEL Execution.
              </Typography>
            </Box>

            {/* Cell 2: Dependencies */}
            <Box sx={{ p: 2, bgcolor: '#0f172a', borderRadius: 2.5, color: '#f8fafc' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                  In [1]: pip install dependencies
                </Typography>
              </Box>
              <Box component="pre" sx={{ m: 0, color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                !pip install -q langchain langchain-community langchain-core google-genai chromadb tiktoken pydantic
              </Box>
            </Box>

            {/* Cell 3: Chunking & Text Splitting */}
            <Box sx={{ p: 2, bgcolor: '#0f172a', borderRadius: 2.5, color: '#f8fafc' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                  In [2]: Document Ingestion & RecursiveCharacterTextSplitter
                </Typography>
              </Box>
              <Box component="pre" sx={{ m: 0, color: '#facc15', fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto' }}>
{`from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

raw_docs = [
    Document(page_content="Cardiology Referral Protocol: Inquire if chest discomfort radiates..."),
    Document(page_content="Oral Surgery Referral: Assess third molar wisdom tooth pericoronitis...")
]

text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=30)
chunks = text_splitter.split_documents(raw_docs)`}
              </Box>
            </Box>

            {/* Cell 4: Custom Pipeline with Temperature */}
            <Box sx={{ p: 2, bgcolor: '#0f172a', borderRadius: 2.5, color: '#f8fafc' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                  In [3]: CustomRAGPipeline with Explicit Temperature Setting
                </Typography>
                <Chip label="Temperature Parameter" size="small" color="secondary" sx={{ height: 20, fontSize: '0.65rem' }} />
              </Box>
              <Box component="pre" sx={{ m: 0, color: '#4ade80', fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto' }}>
{`class CustomRAGPipeline:
    def __init__(self, retriever, temperature=0.2):
        self.retriever = retriever
        self.temperature = temperature # Explicitly configured!
        print(f"[CustomRAGPipeline Initialized] Default Temperature = {self.temperature}")

    def set_temperature(self, temp: float):
        assert 0.0 <= temp <= 1.0, "Temperature must be between 0.0 and 1.0"
        self.temperature = temp

    def invoke(self, query: str, override_temperature=None):
        active_temp = self.temperature if override_temperature is None else override_temperature
        docs = self.retriever.get_relevant_documents(query)
        # LCEL execution: (docs, query, active_temp) -> prompt -> model -> output
        return {"query": query, "temperature": active_temp, "retrieved_chunks": docs}`}
              </Box>
            </Box>

            {/* Cell 5: Testing with Varying Temperature */}
            <Box sx={{ p: 2, bgcolor: '#0f172a', borderRadius: 2.5, color: '#f8fafc' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                  In [4]: Testing Pipeline with Varying Temperature
                </Typography>
              </Box>
              <Box component="pre" sx={{ m: 0, color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.8rem' }}>
{`# Test 1: Low Temperature (0.1 - Deterministic Clinical Inquiries)
res_low = pipeline.invoke("My wisdom tooth is painful", override_temperature=0.1)

# Test 2: Conversational Empathy (0.7)
res_high = pipeline.invoke("My wisdom tooth is painful", override_temperature=0.7)`}
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* TAB 2: PYTHON BACKEND CODE (custom_pipeline.py) */}
      {activeTab === 2 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                File: /backend/app/rag/custom_pipeline.py
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Standalone Python module for backend integration (FastAPI / LangChain)
              </Typography>
            </Box>
            <Chip label="Python 3.10+" color="primary" size="small" sx={{ fontWeight: 800 }} />
          </Box>

          <Box
            component="pre"
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: '#0f172a',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              overflowX: 'auto',
              maxHeight: 520,
            }}
          >
{`import os
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

DEFAULT_TEMPERATURE = 0.2
DEFAULT_TOP_K = 3

@dataclass
class DocumentChunk:
    id: str
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)

class CustomRAGPipeline:
    """
    Custom RAG Pipeline adhering to the LangChain LCEL architecture.
    """
    def __init__(
        self,
        temperature: float = DEFAULT_TEMPERATURE,
        top_k: int = DEFAULT_TOP_K,
        model_name: str = "gemini-3.8-flash",
        api_key: Optional[str] = None,
    ):
        self.temperature = temperature
        self.top_k = top_k
        self.model_name = model_name
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    def set_temperature(self, new_temp: float) -> None:
        if not (0.0 <= new_temp <= 1.0):
            raise ValueError("Temperature must be between 0.0 and 1.0")
        self.temperature = round(new_temp, 2)

    def run(self, query: str, override_temperature: Optional[float] = None):
        temp = self.temperature if override_temperature is None else override_temperature
        # 1. Similarity Retrieval
        # 2. Format Prompt with Temperature
        # 3. Model Invocation
        return {
            "pipeline": "CustomRAGPipeline",
            "temperature": temp,
            "query": query
        }`}
          </Box>
        </Paper>
      )}

      {/* TAB 3: TYPESCRIPT CLIENT/SERVER (customPipeline.ts) */}
      {activeTab === 3 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                File: /src/lib/customPipeline.ts
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Full-stack TypeScript execution engine with temperature calibration
              </Typography>
            </Box>
            <Chip label="TypeScript / React" color="secondary" size="small" sx={{ fontWeight: 800 }} />
          </Box>

          <Box
            component="pre"
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: '#0f172a',
              color: '#a7f3d0',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              overflowX: 'auto',
              maxHeight: 520,
            }}
          >
{`export interface CustomPipelineConfig {
  temperature: number; // 0.0 to 1.0
  topK: number;
  modelName: string;
  enableSafetyGuards: boolean;
}

export class CustomRAGPipeline {
  private config: CustomPipelineConfig;

  constructor(customConfig?: Partial<CustomPipelineConfig>) {
    this.config = {
      temperature: 0.2, // Default medical precision
      topK: 3,
      modelName: 'gemini-3.8-flash',
      enableSafetyGuards: true,
      ...customConfig,
    };
  }

  public setTemperature(temperature: number): void {
    this.config.temperature = Number(temperature.toFixed(2));
  }

  public async execute(rawUtterance: string, overrideTemperature?: number) {
    const effectiveTemp = overrideTemperature ?? this.config.temperature;
    // 1. Safety Guard Evaluation
    // 2. De-identification
    // 3. Hybrid RRF Retrieval (Top-K)
    // 4. Prompt Synthesis with Temperature calibration
    return { ... };
  }
}`}
          </Box>
        </Paper>
      )}
    </Box>
  );
};
