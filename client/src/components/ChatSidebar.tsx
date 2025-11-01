import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageCircle, Plus, Search, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Chat } from "@shared/schema";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentChatId?: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({ isOpen, onClose, currentChatId, onSelectChat, onNewChat }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ['/api/chats'],
  });

  const createChatMutation = useMutation({
    mutationFn: async (): Promise<Chat> => {
      const response = await apiRequest<Chat>('/api/chats', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Chat' }),
      });
      return response;
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      onNewChat();
      onSelectChat(newChat.id);
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      return apiRequest(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    },
  });

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/4 to-accent/8 backdrop-blur-lg border-r border-primary/20 rounded-r-3xl lg:rounded-none"></div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/3 to-transparent rounded-r-3xl lg:rounded-none"></div>
        
        <div className="relative h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-6 pt-16 lg:pt-4">
            <h2 className="text-lg font-semibold text-foreground">Chats</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative group"
                data-testid="button-new-chat"
                onClick={() => createChatMutation.mutate()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-lg backdrop-blur-sm border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <Plus className="w-5 h-5 relative z-10" />
              </Button>
            </div>
          </div>

          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-accent/6 rounded-xl backdrop-blur-sm border border-primary/15"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/3 to-transparent rounded-xl"></div>
            
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground z-10" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="bg-transparent border-0 pl-10 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                data-testid="input-search-chats"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="relative group p-3 rounded-xl cursor-pointer transition-all duration-200"
                data-testid={`chat-item-${chat.id}`}
                onClick={() => {
                  onSelectChat(chat.id);
                  onClose();
                }}
              >
                <div className={`absolute inset-0 rounded-xl backdrop-blur-sm border transition-all duration-200 ${
                  currentChatId === chat.id 
                    ? 'bg-gradient-to-r from-primary/12 via-primary/8 to-accent/12 border-primary/30' 
                    : 'bg-gradient-to-r from-primary/6 via-primary/3 to-accent/6 border-primary/15 group-hover:from-primary/8 group-hover:via-primary/5 group-hover:to-accent/8'
                }`}></div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/3 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                
                <div className="relative z-10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center mt-0.5">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground truncate text-sm">
                        {chat.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatMutation.mutate(chat.id);
                        }}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground/80">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-primary/20">
            <div className="relative group p-3 rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-accent/6 rounded-xl backdrop-blur-sm border border-primary/15"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/2 to-transparent rounded-xl"></div>
              
              <div className="relative z-10 text-center">
                <p className="text-xs text-muted-foreground">
                  Joseph AI • Chat History
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
