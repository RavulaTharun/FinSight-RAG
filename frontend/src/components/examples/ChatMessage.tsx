import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  const citations = [
    { page: 5, chunkId: 12 },
    { page: 8, chunkId: 23 }
  ];

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <ChatMessage 
        role="user"
        content="What was the total revenue in Q4 2023?"
      />
      <ChatMessage 
        role="assistant"
        content="Based on the financial report, the total revenue in Q4 2023 was $2.4 billion, representing a 15% increase year-over-year. (page: 5, chunk: 12) The growth was primarily driven by cloud services and enterprise solutions. (page: 8, chunk: 23)"
        citations={citations}
        onCitationClick={(citation) => console.log('Citation clicked:', citation)}
      />
    </div>
  );
}
