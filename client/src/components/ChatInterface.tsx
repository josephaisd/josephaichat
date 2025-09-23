import { useState, useRef, useEffect } from "react";
import Header from "./Header";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Joseph AI, your intelligent assistant. I'm here to help you with questions, creative tasks, analysis, and much more. What would you like to explore today?",
      isAI: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response - todo: remove mock functionality
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for your message: "${content}". I'm a prototype interface, so I can't provide real AI responses yet, but I'm designed to handle conversations with intelligence and care. This beautiful liquid glass interface will soon be powered by advanced AI capabilities!`,
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>
      
      <Header onToggleSidebar={() => console.log('Sidebar toggle triggered')} />
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pt-20 pb-4" data-testid="chat-messages">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.content}
              isAI={message.isAI}
              timestamp={message.timestamp}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isTyping}
        placeholder={isTyping ? "Joseph is thinking..." : "Ask Joseph anything..."}
      />
    </div>
  );
}