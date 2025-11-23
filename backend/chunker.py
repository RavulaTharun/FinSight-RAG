"""
Text chunking module for splitting documents into retrievable chunks
"""
from typing import List, Dict

class TextChunker:
    def __init__(self, chunk_size: int = 3600, overlap: int = 800):
        """
        Initialize chunker with character-based chunking
        
        Args:
            chunk_size: Target characters per chunk (~900 tokens)
            overlap: Character overlap between chunks
        """
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def chunk_text(self, pages_data: List[Dict]) -> List[Dict]:
        """
        Chunk text from pages into overlapping chunks
        
        Args:
            pages_data: List of dicts with 'page' and 'text' keys
            
        Returns:
            List of chunks with metadata
        """
        chunks = []
        chunk_id = 0
        
        for page_data in pages_data:
            page_num = page_data['page']
            text = page_data['text']
            
            # Split into chunks with overlap
            start = 0
            while start < len(text):
                end = start + self.chunk_size
                chunk_text = text[start:end]
                
                if chunk_text.strip():  # Only add non-empty chunks
                    chunks.append({
                        'chunk_id': chunk_id,
                        'page': page_num,
                        'text': chunk_text.strip(),
                        'start_char': start,
                        'end_char': end
                    })
                    chunk_id += 1
                
                # Move start forward, accounting for overlap
                start += (self.chunk_size - self.overlap)
                
                # Break if we're at the end
                if end >= len(text):
                    break
        
        return chunks
