import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar } from "lucide-react";
import type { Citation } from "./ChatMessage";

interface DocumentStats {
  pages: number;
  chunks: number;
  uploadDate: string;
}

interface RecentCitation extends Citation {
  snippet: string;
}

interface DocumentSidebarProps {
  stats: DocumentStats;
  recentCitations: RecentCitation[];
  onCitationClick: (citation: Citation) => void;
}

export default function DocumentSidebar({ stats, recentCitations, onCitationClick }: DocumentSidebarProps) {
  return (
    <div className="w-full md:max-w-md h-full border-l border-border bg-sidebar p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4" data-testid="text-sidebar-title">Document Context</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Pages</p>
            </div>
            <p className="text-2xl font-semibold" data-testid="text-stat-pages">{stats.pages}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Chunks</p>
            </div>
            <p className="text-2xl font-semibold" data-testid="text-stat-chunks">{stats.chunks}</p>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Uploaded</p>
            <p className="text-sm ml-auto" data-testid="text-upload-date">{stats.uploadDate}</p>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3" data-testid="text-recent-citations">Recent Citations</h3>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {recentCitations.map((citation, index) => (
              <Card
                key={index}
                className="p-3 cursor-pointer hover-elevate active-elevate-2"
                onClick={() => onCitationClick(citation)}
                data-testid={`card-citation-${index}`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    Page {citation.page}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    Chunk {citation.chunkId}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {citation.snippet}
                </p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
