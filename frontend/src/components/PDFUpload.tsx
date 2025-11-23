import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  uploadedFile?: { name: string; pages: number } | null;
}

export default function PDFUpload({ onFileSelect, isProcessing, uploadedFile }: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  if (uploadedFile) {
    return (
      <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-card-border">
        <FileText className="w-6 h-6 text-primary" data-testid="icon-pdf" />
        <div className="flex-1">
          <p className="font-medium text-base" data-testid="text-filename">{uploadedFile.name}</p>
          <p className="text-xs text-muted-foreground" data-testid="text-pagecount">{uploadedFile.pages} pages</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => document.getElementById('pdf-input')?.click()}
          data-testid="button-change-document"
        >
          Change Document
        </Button>
        <input
          id="pdf-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-2xl">
        <div
          className={`relative w-full aspect-video rounded-xl border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="dropzone-upload"
        >
          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileInput}
          />
          <label
            htmlFor="pdf-input"
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-16 h-16 text-muted-foreground mb-6" />
            <h3 className="text-xl font-semibold mb-2" data-testid="text-upload-title">
              Upload Financial Document
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="text-upload-subtitle">
              PDF format, up to 50MB
            </p>
            <Button className="mt-6" disabled={isProcessing} data-testid="button-upload">
              {isProcessing ? 'Processing...' : 'Choose File'}
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}
