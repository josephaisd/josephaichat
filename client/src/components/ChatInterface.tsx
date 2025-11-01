import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Header from "./Header";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import ChatSidebar from "./ChatSidebar";
import LoadingScreen from "./LoadingScreen";
import type { Chat, Message } from "@shared/schema";

interface MessageDisplay {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: string;
  imageUrl?: string;
}

export default function ChatInterface() {
  const { isAuthenticated } = useAuth();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chats } = useQuery<Chat[]>({
    queryKey: ['/api/chats'],
    enabled: !isLoading && isAuthenticated,
  });

  const { data: fetchedMessages } = useQuery<Message[]>({
    queryKey: ['/api/chats', currentChatId, 'messages'],
    enabled: !!currentChatId && isAuthenticated,
  });

  const createChatMutation = useMutation({
    mutationFn: async (title: string) => {
      return apiRequest<Chat>('/api/chats', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      setCurrentChatId(newChat.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, message, imageUrl }: { chatId: string; message: string; imageUrl?: string }) => {
      return apiRequest<Message>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ chatId, message, imageUrl }),
      });
    },
    onSuccess: (aiMessage, variables) => {
      if (variables.chatId) {
        queryClient.invalidateQueries({ queryKey: ['/api/chats', variables.chatId, 'messages'] });
      }
      setMessages(prev => [...prev, {
        id: aiMessage.id,
        content: aiMessage.content,
        isAI: aiMessage.isAi,
        timestamp: new Date(aiMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        isAI: msg.isAi,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: msg.imageUrl || undefined
      })));
    }
  }, [fetchedMessages]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && chats && chats.length > 0 && !currentChatId) {
      setCurrentChatId(chats[0].id);
    } else if (!isLoading && isAuthenticated && (!chats || chats.length === 0) && !currentChatId) {
      createChatMutation.mutate("New Chat");
    } else if (!isLoading && !isAuthenticated && !currentChatId) {
      setCurrentChatId("guest-chat-" + Date.now());
    }
  }, [isLoading, isAuthenticated, chats, currentChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    const userMessage: MessageDisplay = {
      id: Date.now().toString(),
      content,
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    if (!isAuthenticated) {
      try {
        const response = await fetch('/api/chat/guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            imageUrl,
            history: messages.map(m => ({
              role: m.isAI ? 'assistant' : 'user',
              content: m.content
            }))
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        const aiMessage: MessageDisplay = {
          id: Date.now().toString(),
          content: data.content,
          isAI: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        const errorMessage: MessageDisplay = {
          id: Date.now().toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          isAI: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (!currentChatId) {
      const newChat = await createChatMutation.mutateAsync("New Chat");
      setCurrentChatId(newChat.id);
      sendMessageMutation.mutate({ chatId: newChat.id, message: content, imageUrl });
      return;
    }

    sendMessageMutation.mutate({ chatId: currentChatId, message: content, imageUrl });
  };

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>
      
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex flex-col flex-1 lg:ml-0">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
        />
        
        <div className="flex-1 overflow-y-auto pt-20 pb-4" data-testid="chat-messages">
          <div className="max-w-4xl mx-auto px-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">Welcome to Joseph AI</h2>
                <p className="text-muted-foreground">Start a conversation by sending a message below.</p>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.content}
                isAI={message.isAI}
                timestamp={message.timestamp}
                imageUrl={message.imageUrl}
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
    </div>
  );
}
