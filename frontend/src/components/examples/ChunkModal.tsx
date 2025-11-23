import { useState } from 'react';
import ChunkModal from '../ChunkModal';
import { Button } from '@/components/ui/button';

export default function ChunkModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  const mockContent = `Revenue Recognition

Total revenue for Q4 2023 reached $2.4 billion, representing a 15% year-over-year increase. This growth was primarily driven by:

1. Cloud Services: $1.2B (+22% YoY)
2. Enterprise Solutions: $800M (+12% YoY)  
3. Professional Services: $400M (+8% YoY)

The strong performance in cloud services reflects increased adoption of our infrastructure platform and growing enterprise customer base.`;

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)} data-testid="button-open-modal">
        View Chunk Example
      </Button>
      <ChunkModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        page={5}
        chunkId={12}
        content={mockContent}
      />
    </div>
  );
}
