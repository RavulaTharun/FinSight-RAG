"""
PDF Parser using pdfplumber for text extraction
"""
import pdfplumber
from typing import List, Dict

class PDFParser:
    def __init__(self):
        pass
    
    def parse_pdf(self, pdf_path: str) -> Dict[str, any]:
        """
        Extract text from PDF file
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Dictionary with pages and extracted text
        """
        pages_text = []
        
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text:
                    pages_text.append({
                        'page': page_num,
                        'text': text
                    })
        
        return {
            'total_pages': total_pages,
            'pages': pages_text
        }
