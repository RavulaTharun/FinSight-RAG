import DocumentSidebar from '../DocumentSidebar';

export default function DocumentSidebarExample() {
  const mockStats = {
    pages: 45,
    chunks: 128,
    uploadDate: 'Nov 22, 2025'
  };

  const mockCitations = [
    {
      page: 5,
      chunkId: 12,
      snippet: 'Total revenue for Q4 2023 reached $2.4 billion, representing a 15% year-over-year increase...'
    },
    {
      page: 8,
      chunkId: 23,
      snippet: 'The growth was primarily driven by cloud services and enterprise solutions, with cloud revenue...'
    },
    {
      page: 12,
      chunkId: 34,
      snippet: 'Operating expenses increased by 8% to $1.8 billion, primarily due to investments in R&D...'
    }
  ];

  return (
    <div className="h-screen">
      <DocumentSidebar
        stats={mockStats}
        recentCitations={mockCitations}
        onCitationClick={(citation) => console.log('Citation clicked:', citation)}
      />
    </div>
  );
}
