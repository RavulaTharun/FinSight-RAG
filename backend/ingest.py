"""
Document ingestion pipeline
"""
from pdf_parser import PDFParser
from chunker import TextChunker
from embedder import Embedder
from faiss_store import FAISSStore
from typing import Dict

class DocumentIngestor:
    def __init__(self):
        """Initialize the ingestion pipeline"""
        self.pdf_parser = PDFParser()
        self.chunker = TextChunker(chunk_size=3600, overlap=800)
        self.embedder = Embedder('all-MiniLM-L6-v2')
        self.vector_store = FAISSStore(dimension=384)
    
    def ingest_pdf(self, pdf_path: str) -> Dict:
        """
        Full ingestion pipeline: parse -> chunk -> embed -> store
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Dictionary with ingestion stats
        """
        print("Step 1: Parsing PDF...")
        parsed_data = self.pdf_parser.parse_pdf(pdf_path)
        
        print("Step 2: Chunking text...")
        chunks = self.chunker.chunk_text(parsed_data['pages'])
        
        print(f"Step 3: Generating embeddings for {len(chunks)} chunks...")
        chunk_texts = [chunk['text'] for chunk in chunks]
        embeddings = self.embedder.embed_texts(chunk_texts)
        
        print("Step 4: Building FAISS index...")
        self.vector_store.add_embeddings(embeddings, chunks)
        
        return {
            'total_pages': parsed_data['total_pages'],
            'total_chunks': len(chunks),
            'status': 'success'
        }
    
    def query(self, query_text: str, top_k: int = 6) -> list:
        """
        Query the vector store
        
        Args:
            query_text: Query string
            top_k: Number of results
            
        Returns:
            List of relevant chunks
        """
        query_embedding = self.embedder.embed_query(query_text)
        results = self.vector_store.search(query_embedding, top_k)
        return results
    
    def get_chunk(self, chunk_id: int) -> Dict:
        """Get a specific chunk by ID"""
        return self.vector_store.get_chunk_by_id(chunk_id)
    
    def reset(self):
        """Reset the system"""
        self.vector_store.reset()
