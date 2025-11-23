import ProcessingIndicator from '../ProcessingIndicator';

export default function ProcessingIndicatorExample() {
  const mockSteps = [
    { label: 'Uploading PDF', status: 'complete' as const },
    { label: 'Extracting text & tables', status: 'complete' as const },
    { label: 'Creating embeddings', status: 'processing' as const },
    { label: 'Building search index', status: 'pending' as const }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <ProcessingIndicator steps={mockSteps} />
    </div>
  );
}
