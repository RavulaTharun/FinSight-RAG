"""
FAISS vector store for similarity search
"""
import faiss
import numpy as np
import json
from typing import List, Dict, Tuple

class FAISSStore:
    def __init__(self, dimension: int = 384):
        """
        Initialize FAISS index
        
        Args:
            dimension: Dimension of embedding vectors
        """
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
        self.chunks = []
        self.metadata = []
    
    def add_embeddings(self, embeddings: np.ndarray, chunks: List[Dict]):
        """
        Add embeddings and their metadata to the index
        
        Args:
            embeddings: Numpy array of embedding vectors
            chunks: List of chunk dictionaries with metadata
        """
        self.index.add(embeddings.astype('float32'))
        self.chunks.extend(chunks)
        self.metadata.extend([{
            'chunk_id': chunk['chunk_id'],
            'page': chunk['page'],
            'text': chunk['text']
        } for chunk in chunks])
    
    def search(self, query_embedding: np.ndarray, top_k: int = 6) -> List[Dict]:
        """
        Search for similar chunks
        
        Args:
            query_embedding: Query embedding vector
            top_k: Number of results to return
            
        Returns:
            List of chunks with similarity scores
        """
        query_embedding = query_embedding.reshape(1, -1).astype('float32')
        distances, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.metadata):
                result = self.metadata[idx].copy()
                result['score'] = float(distance)
                results.append(result)
        
        return results
    
    def save(self, index_path: str, metadata_path: str):
        """
        Save index and metadata to disk
        
        Args:
            index_path: Path to save FAISS index
            metadata_path: Path to save metadata JSON
        """
        faiss.write_index(self.index, index_path)
        with open(metadata_path, 'w') as f:
            json.dump(self.metadata, f)
    
    def load(self, index_path: str, metadata_path: str):
        """
        Load index and metadata from disk
        
        Args:
            index_path: Path to FAISS index
            metadata_path: Path to metadata JSON
        """
        self.index = faiss.read_index(index_path)
        with open(metadata_path, 'r') as f:
            self.metadata = json.load(f)
    
    def get_chunk_by_id(self, chunk_id: int) -> Dict:
        """
        Retrieve a specific chunk by ID
        
        Args:
            chunk_id: Chunk ID
            
        Returns:
            Chunk dictionary
        """
        for chunk in self.metadata:
            if chunk['chunk_id'] == chunk_id:
                return chunk
        return None
    
    def reset(self):
        """Reset the index and metadata"""
        self.index = faiss.IndexFlatIP(self.dimension)
        self.chunks = []
        self.metadata = []
