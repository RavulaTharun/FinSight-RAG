import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, RotateCcw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import PDFUpload from "@/components/PDFUpload";
import ChatMessage, { type Citation } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChunkModal from "@/components/ChunkModal";
import DocumentSidebar from "@/components/DocumentSidebar";
import ProcessingIndicator from "@/components/ProcessingIndicator";
import TypingIndicator from "@/components/TypingIndicator";
import { uploadPDF, queryDocument, getChunk, resetApplication } from "@/lib/api";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export default function ChatPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; pages: number; chunks?: number; uploadDate?: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChunk, setSelectedChunk] = useState<{ page: number; chunkId: number; content: string } | null>(null);
  const [recentCitations, setRecentCitations] = useState<Array<{ page: number; chunkId: number; snippet: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: uploadPDF,
    onSuccess: (data) => {
      setUploadedFile({
        name: data.filename,
        pages: data.pages,
        chunks: data.chunks,
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      toast({
        title: "PDF uploaded successfully",
        description: `Processed ${data.pages} pages and created ${data.chunks} chunks`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const queryMutation = useMutation({
    mutationFn: queryDocument,
    onSuccess: (data, variables) => {
      const citations: Citation[] = [];
      const citationRegex = /\(page:\s*(\d+),\s*chunk:\s*(\d+)\)/g;
      let match;
      
      while ((match = citationRegex.exec(data.answer)) !== null) {
        citations.push({
          page: parseInt(match[1]),
          chunkId: parseInt(match[2]),
        });
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        citations: citations.length > 0 ? citations : undefined,
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      if (data.chunks.length > 0) {
        const newCitations = data.chunks.slice(0, 2).map(chunk => ({
          page: chunk.page,
          chunkId: chunk.chunk_id,
          snippet: chunk.text.substring(0, 100) + '...',
        }));
        setRecentCitations(prev => [...newCitations, ...prev.slice(0, 3)]);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Query failed",
        description: error.message,
        variant: "destructive",
      });
      setMessages(prev => prev.filter(m => m.role !== 'user' || m.content !== queryMutation.variables));
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetApplication,
    onSuccess: () => {
      setUploadedFile(null);
      setMessages([]);
      setRecentCitations([]);
      toast({
        title: "Application reset",
        description: "All data has been cleared",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processingSteps: Array<{ label: string; status: 'pending' | 'processing' | 'complete' }> = [
    { label: 'Uploading PDF', status: uploadMutation.isPending ? 'complete' : 'pending' },
    { label: 'Extracting text & tables', status: uploadMutation.isPending ? 'processing' : 'pending' },
    { label: 'Creating embeddings', status: 'pending' },
    { label: 'Building search index', status: 'pending' }
  ];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, queryMutation.isPending]);

  const handleFileSelect = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleSendMessage = (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    queryMutation.mutate(content);
  };

  const handleCitationClick = async (citation: Citation) => {
    try {
      const chunk = await getChunk(citation.chunkId);
      setSelectedChunk({
        page: chunk.page,
        chunkId: chunk.chunk_id,
        content: chunk.text,
      });
    } catch (error) {
      toast({
        title: "Failed to load chunk",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (uploadMutation.isPending) {
    return (
      <div className="h-screen flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-border h-16">
          <h1 className="text-2xl font-semibold" data-testid="text-app-title">FinSight</h1>
          <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <ProcessingIndicator steps={processingSteps} />
        </div>
      </div>
    );
  }

  if (!uploadedFile) {
    return (
      <div className="h-screen flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-border h-16">
          <h1 className="text-2xl font-semibold" data-testid="text-app-title">FinSight</h1>
          <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </header>
        <PDFUpload onFileSelect={handleFileSelect} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border h-16">
        <h1 className="text-2xl font-semibold" data-testid="text-app-title">FinSight</h1>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleReset}
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border">
            <PDFUpload 
              onFileSelect={handleFileSelect} 
              uploadedFile={uploadedFile}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <h2 className="text-xl font-medium mb-2" data-testid="text-welcome-title">
                    Ready to Analyze
                  </h2>
                  <p className="text-muted-foreground" data-testid="text-welcome-subtitle">
                    Ask questions about your financial document. I'll provide answers with citations to specific pages and sections.
                  </p>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                citations={message.citations}
                onCitationClick={handleCitationClick}
              />
            ))}
            {queryMutation.isPending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput 
            onSend={handleSendMessage} 
            disabled={queryMutation.isPending}
            placeholder="Ask a question about the document..."
          />
        </div>

        <div className="hidden lg:block">
          <DocumentSidebar
            stats={{
              pages: uploadedFile?.pages || 0,
              chunks: uploadedFile?.chunks || 0,
              uploadDate: uploadedFile?.uploadDate || '',
            }}
            recentCitations={recentCitations}
            onCitationClick={handleCitationClick}
          />
        </div>
      </div>

      {selectedChunk && (
        <ChunkModal
          isOpen={!!selectedChunk}
          onClose={() => setSelectedChunk(null)}
          page={selectedChunk.page}
          chunkId={selectedChunk.chunkId}
          content={selectedChunk.content}
        />
      )}
    </div>
  );
}
