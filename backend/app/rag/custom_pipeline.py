"""
================================================================================
Custom RAG Pipeline Module (custom_pipeline.py)
Reference: LangChain RAG Course: From Basics to Production-Ready RAG Chatbot
(https://youtu.be/38aMTXY2usU)
================================================================================
This module defines the separated Custom Pipeline for the Clinical Intake
Chatbot, separating:
1. Document Ingestion & Chunking (Recursive Character Splitter)
2. Embeddings & Vector Store indexing (Similarity Retriever)
3. Prompt Engineering & System Safety Guards
4. Model Invocation with Configurable Temperature Parameter
5. End-to-end LCEL (LangChain Expression Language) Pipeline
"""

import os
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

# Default temperature: 0.2 (Clinical intake requires high deterministic precision)
DEFAULT_TEMPERATURE = 0.2
DEFAULT_TOP_K = 3

@dataclass
class DocumentChunk:
    id: str
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)

class ClinicalDocumentStore:
    """Simulated local Vector Store / Corpus for Clinical Intake protocols."""
    def __init__(self):
        self.documents: List[DocumentChunk] = [
            DocumentChunk(
                id="CARD-CHEST-LOC",
                content="Protocol: Inquire if chest discomfort is substernal, crushing, sharp, or dull. Check radiation.",
                metadata={"specialty": "Cardiology", "urgency": "high"}
            ),
            DocumentChunk(
                id="CARD-CHEST-RAD",
                content="Protocol: Ask if chest pain radiates to left arm, neck, jaw, or shoulder blade.",
                metadata={"specialty": "Cardiology", "urgency": "emergency"}
            ),
            DocumentChunk(
                id="DENT-WISDOM-IMP",
                content="Protocol: Assess third molar (wisdom tooth) pericoronitis, trismus, and mandibular swelling.",
                metadata={"specialty": "Oral Surgery", "urgency": "routine"}
            ),
            DocumentChunk(
                id="DENT-TRISMUS-RED",
                content="Protocol: Red Flag: Reduced jaw opening <2 fingers, difficulty swallowing or breathing. Escalate to A&E / OMFS.",
                metadata={"specialty": "Oral Surgery", "urgency": "emergency"}
            ),
            DocumentChunk(
                id="RESP-DYSPNEA-REST",
                content="Protocol: Inquire if shortness of breath occurs at rest or exertion. Check orthopnea pillow count.",
                metadata={"specialty": "Pulmonology", "urgency": "urgent"}
            ),
            DocumentChunk(
                id="NEURO-HEAD-THUNDER",
                content="Protocol: Red Flag: Sudden thunderclap headache reaching maximum severity in seconds. Immediate ER referral.",
                metadata={"specialty": "Neurology", "urgency": "emergency"}
            ),
        ]

    def similarity_search(self, query: str, top_k: int = DEFAULT_TOP_K) -> List[DocumentChunk]:
        """Simple lexical-dense ranker for standalone Python execution."""
        tokens = set(query.lower().split())
        scored = []
        for doc in self.documents:
            doc_tokens = set(doc.content.lower().split())
            overlap = len(tokens.intersection(doc_tokens))
            scored.append((overlap, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:top_k]]


class CustomRAGPipeline:
    """
    Custom RAG Pipeline adhering to the LangChain LCEL architecture.
    
    Attributes:
        temperature (float): Controls response randomness/determinism.
            - 0.0 - 0.2: Highly factual, strict adherence to protocol (Recommended for Medical Intake).
            - 0.5 - 0.7: Conversational, empathetic tone.
        top_k (int): Number of context chunks retrieved from vector store.
        model_name (str): Foundation model identifier.
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
        self.doc_store = ClinicalDocumentStore()

    def set_temperature(self, new_temp: float) -> None:
        """Dynamically update the pipeline's temperature."""
        if not (0.0 <= new_temp <= 1.0):
            raise ValueError(f"Temperature must be between 0.0 and 1.0, got {new_temp}")
        self.temperature = round(new_temp, 2)

    def format_prompt(self, query: str, context_chunks: List[DocumentChunk], chat_history: List[Dict[str, str]]) -> str:
        """Builds the grounded clinical prompt with explicit constraints."""
        formatted_context = "\n".join([f"[{c.id}] {c.content}" for c in context_chunks])
        
        system_instruction = (
            "You are a clinical intake assistant for Dr. Butterfly Clinic.\n"
            "MANDATORY INVARIANTS:\n"
            "1. NEVER provide a final diagnosis or medical prescription.\n"
            "2. Ground every follow-up question in the provided clinical protocols.\n"
            "3. If emergency red-flags are present (severe chest radiation, stridor, trismus <2 fingers), escalate immediately.\n"
            f"4. Generation Temperature is set to {self.temperature}.\n"
        )
        
        prompt = (
            f"=== SYSTEM INSTRUCTION ===\n{system_instruction}\n"
            f"=== RETRIEVED CONTEXT (Top {len(context_chunks)}) ===\n{formatted_context}\n\n"
            f"=== PATIENT QUERY ===\n{query}\n\n"
            f"=== ASSISTANT INTAKE RESPONSE ==="
        )
        return prompt

    def run(self, query: str, chat_history: Optional[List[Dict[str, str]]] = None, override_temperature: Optional[float] = None) -> Dict[str, Any]:
        """
        Executes the Custom Pipeline:
        1. Query -> Vector Store Retrieval
        2. Context + Query + History -> Prompt Template
        3. Model Call with Temperature parameter
        4. Structured Output Formatting
        """
        temp = self.temperature if override_temperature is None else override_temperature
        history = chat_history or []

        # Step 1: Retrieval
        retrieved_docs = self.doc_store.similarity_search(query, top_k=self.top_k)

        # Step 2: Prompt construction
        prompt = self.format_prompt(query, retrieved_docs, history)

        # Step 3: LLM generation (using Google GenAI if key present, else deterministic fallback)
        generated_text = ""
        model_used = self.model_name

        if self.api_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.api_key)
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={"temperature": temp}
                )
                generated_text = response.text or ""
            except Exception as e:
                generated_text = f"[LLM Invocation via Gemini API: {str(e)}]. Fallback to protocol guidance."

        if not generated_text:
            # Deterministic simulation matching pipeline output
            top_doc = retrieved_docs[0] if retrieved_docs else None
            generated_text = (
                f"Thank you for describing this. Based on our clinical intake protocol ({top_doc.id if top_doc else 'Standard'}), "
                f"could you please specify how long you have experienced these symptoms and their current intensity on a 1-10 scale?"
            )

        return {
            "pipeline": "CustomRAGPipeline",
            "temperature": temp,
            "top_k": self.top_k,
            "query": query,
            "retrieved_chunks": [
                {"id": d.id, "content": d.content, "metadata": d.metadata}
                for d in retrieved_docs
            ],
            "response": generated_text,
            "prompt_preview": prompt[:300] + "...",
        }


# Direct execution self-test
if __name__ == "__main__":
    pipeline = CustomRAGPipeline(temperature=0.2)
    print("Testing Custom RAG Pipeline at temperature:", pipeline.temperature)
    result = pipeline.run("I have severe jaw pain and cannot open my mouth")
    print("\nResult:")
    print(json.dumps(result, indent=2))
