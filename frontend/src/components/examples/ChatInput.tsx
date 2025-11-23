import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1" />
      <ChatInput 
        onSend={(msg) => console.log('Message sent:', msg)}
        placeholder="Ask a question about the document..."
      />
    </div>
  );
}
