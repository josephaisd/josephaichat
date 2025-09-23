import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4">
        <p className="text-center text-muted-foreground">Chat input component displayed at bottom</p>
      </div>
      <ChatInput 
        onSendMessage={(message) => console.log('Message sent:', message)}
        placeholder="Type your message to Joseph AI..."
      />
    </div>
  );
}