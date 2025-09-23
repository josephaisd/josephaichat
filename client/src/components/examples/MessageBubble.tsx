import MessageBubble from '../MessageBubble';

export default function MessageBubbleExample() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <MessageBubble 
        message="Hello! I'm Joseph AI, your intelligent assistant. How can I help you today?" 
        isAI={true}
        timestamp="2:30 PM"
      />
      <MessageBubble 
        message="Can you help me understand quantum computing?" 
        isAI={false}
        timestamp="2:31 PM"
      />
      <MessageBubble 
        message="I'd be happy to explain quantum computing! Quantum computing is a revolutionary technology that uses quantum mechanical phenomena like superposition and entanglement to process information in ways that classical computers cannot." 
        isAI={true}
        timestamp="2:31 PM"
      />
    </div>
  );
}