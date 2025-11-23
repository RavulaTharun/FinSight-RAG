import { Badge } from "@/components/ui/badge";

export interface Citation {
  page: number;
  chunkId: number;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

export default function ChatMessage({ role, content, citations, onCitationClick }: ChatMessageProps) {
  const isUser = role === 'user';

  const renderContentWithCitations = () => {
    if (!citations || citations.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    }

    const parts = content.split(/(\(page: \d+, chunk: \d+\))/g);
    
    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, index) => {
          const match = part.match(/\(page: (\d+), chunk: (\d+)\)/);
          if (match) {
            const citation = { page: parseInt(match[1]), chunkId: parseInt(match[2]) };
            return (
              <Badge
                key={index}
                variant="secondary"
                className="mx-1 cursor-pointer font-mono text-xs hover-elevate active-elevate-2"
                onClick={() => onCitationClick?.(citation)}
                data-testid={`badge-citation-${citation.page}-${citation.chunkId}`}
              >
                Page {citation.page}, Chunk {citation.chunkId}
              </Badge>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      data-testid={`message-${role}`}
    >
      <div
        className={`max-w-3xl px-6 py-4 ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md ml-auto'
            : 'bg-card text-card-foreground rounded-2xl rounded-bl-md mr-auto border border-card-border'
        }`}
      >
        {renderContentWithCitations()}
      </div>
    </div>
  );
}
