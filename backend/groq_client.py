"""
Groq LLM client for generating answers
"""
import os
import requests
from typing import List, Dict

class GroqClient:
    def __init__(self):
        """Initialize Groq client"""
        self.api_key = os.getenv('GROQ_API_KEY')
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.3-70b-versatile"  # Using available model instead of gpt-oss-120b
        
    def generate_answer(self, query: str, retrieved_chunks: List[Dict], chat_history: List[Dict] = None) -> str:
        """
        Generate answer using Groq LLM
        
        Args:
            query: User query
            retrieved_chunks: List of retrieved chunks from FAISS
            chat_history: Previous conversation messages
            
        Returns:
            Generated answer with citations
        """
        # If no API key, return local fallback
        if not self.api_key:
            return self._local_fallback(retrieved_chunks)
        
        # Build context from retrieved chunks
        context = self._build_context(retrieved_chunks)
        
        # Build messages
        messages = self._build_messages(query, context, chat_history)
        
        try:
            response = requests.post(
                self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 1000
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content']
            else:
                print(f"Groq API error: {response.status_code} - {response.text}")
                return self._local_fallback(retrieved_chunks)
                
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return self._local_fallback(retrieved_chunks)
    
    def _build_context(self, chunks: List[Dict]) -> str:
        """Build context string from chunks"""
        context_parts = []
        for chunk in chunks:
            context_parts.append(
                f"[Page {chunk['page']}, Chunk {chunk['chunk_id']}]\n{chunk['text']}\n"
            )
        return "\n---\n".join(context_parts)
    
    def _build_messages(self, query: str, context: str, chat_history: List[Dict] = None) -> List[Dict]:
        """Build message array for LLM"""
        system_prompt = """You are FinSight — an expert Financial Analyst and RAG Assistant.

Your role is to answer questions about financial documents with precision and clarity.

CRITICAL RULES:
1. Use ONLY the retrieved document chunks as evidence
2. ALWAYS cite sources in this exact format: (page: X, chunk: Y)
3. If information is not in the provided chunks, say: "Not available in the provided document."
4. For follow-up questions, extend your previous answer with new context
5. Structure your responses clearly with bullet points or paragraphs as appropriate
6. Never hallucinate or make up information

Example citation format:
"The total revenue was $2.4 billion in Q4 2023. (page: 5, chunk: 12)"

Be professional, accurate, and helpful. Financial professionals rely on your precision."""

        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add chat history if provided (last 10 messages)
        if chat_history:
            messages.extend(chat_history[-10:])
        
        # Add current query with context
        user_message = f"""Retrieved document context:

{context}

---

User question: {query}

Please answer based on the retrieved context above, citing sources."""

        messages.append({"role": "user", "content": user_message})
        
        return messages
    
    def _local_fallback(self, chunks: List[Dict]) -> str:
        """Fallback response when Groq API is unavailable"""
        if not chunks:
            return "No relevant information found in the document."
        
        response = "Here are the most relevant excerpts from the document:\n\n"
        
        for chunk in chunks[:3]:  # Show top 3 chunks
            response += f"**Page {chunk['page']}, Chunk {chunk['chunk_id']}:**\n"
            response += f"{chunk['text'][:300]}...\n\n"
        
        response += "\n_Note: Running in local mode. Set GROQ_API_KEY environment variable for AI-powered responses._"
        
        return response
