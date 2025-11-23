import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChunkModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: number;
  chunkId: number;
  content: string;
}

export default function ChunkModal({ isOpen, onClose, page, chunkId, content }: ChunkModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]" data-testid="modal-chunk">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Document Chunk</span>
            <Badge variant="secondary" className="font-mono" data-testid="badge-chunk-id">
              Page {page}, Chunk {chunkId}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid="text-chunk-content">
              {content}
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
