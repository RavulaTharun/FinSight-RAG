"""
Embeddings module using SentenceTransformers
"""
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List

class Embedder:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize embedder with SentenceTransformer model
        
        Args:
            model_name: Name of the sentence transformer model
        """
        print(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.dimension = 384  # all-MiniLM-L6-v2 produces 384-dim vectors
    
    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for a list of texts
        
        Args:
            texts: List of text strings
            
        Returns:
            Numpy array of embeddings (normalized)
        """
        embeddings = self.model.encode(texts, show_progress_bar=True)
        
        # Normalize vectors for cosine similarity with inner product
        embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
        
        return embeddings
    
    def embed_query(self, query: str) -> np.ndarray:
        """
        Generate embedding for a single query
        
        Args:
            query: Query string
            
        Returns:
            Normalized embedding vector
        """
        embedding = self.model.encode([query])[0]
        embedding = embedding / np.linalg.norm(embedding)
        return embedding
