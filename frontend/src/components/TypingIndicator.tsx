export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6" data-testid="indicator-typing">
      <div className="max-w-3xl px-6 py-4 bg-card text-card-foreground rounded-2xl rounded-bl-md border border-card-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-muted-foreground ml-2">Analyzing document...</span>
        </div>
      </div>
    </div>
  );
}
