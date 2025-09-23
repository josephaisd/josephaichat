import { useState } from "react";
import { MessageCircle, Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock chat data - todo: remove mock functionality
  const chats: Chat[] = [
    {
      id: "1",
      title: "Creative Writing",
      lastMessage: "Help me write a story about...",
      timestamp: "2 min ago",
      isActive: true
    },
    {
      id: "2", 
      title: "Code Review",
      lastMessage: "Can you review this React component?",
      timestamp: "1 hour ago"
    },
    {
      id: "3",
      title: "Learning Python",
      lastMessage: "Explain list comprehensions",
      timestamp: "Yesterday"
    },
    {
      id: "4",
      title: "Project Planning",
      lastMessage: "Break down this project into tasks",
      timestamp: "2 days ago"
    },
    {
      id: "5",
      title: "Research Assistant",
      lastMessage: "Find information about quantum computing",
      timestamp: "3 days ago"
    }
  ];

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Liquid glass background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/4 to-accent/8 backdrop-blur-lg border-r border-primary/20 rounded-r-3xl lg:rounded-none"></div>
        
        {/* Glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/3 to-transparent rounded-r-3xl lg:rounded-none"></div>
        
        <div className="relative h-full flex flex-col p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-2">
            <h2 className="text-lg font-semibold text-foreground">Chats</h2>
            <Button
              variant="ghost"
              size="icon"
              className="relative group"
              data-testid="button-new-chat"
              onClick={() => console.log('New chat triggered')}
            >
              {/* Glass button background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-lg backdrop-blur-sm border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <Plus className="w-5 h-5 relative z-10" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative group mb-4">
            {/* Glass search background */}
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

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`relative group p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  chat.isActive ? 'ring-2 ring-primary/30' : ''
                }`}
                data-testid={`chat-item-${chat.id}`}
                onClick={() => console.log(`Chat ${chat.id} selected`)}
              >
                {/* Glass chat item background */}
                <div className={`absolute inset-0 rounded-xl backdrop-blur-sm border transition-all duration-200 ${
                  chat.isActive 
                    ? 'bg-gradient-to-r from-primary/12 via-primary/8 to-accent/12 border-primary/25' 
                    : 'bg-gradient-to-r from-primary/6 via-primary/3 to-accent/6 border-primary/15 group-hover:from-primary/8 group-hover:via-primary/5 group-hover:to-accent/8'
                }`}></div>
                
                {/* Glass reflection */}
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
                          console.log(`More options for chat ${chat.id}`);
                        }}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {chat.lastMessage}
                    </p>
                    <span className="text-xs text-muted-foreground/80">
                      {chat.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-primary/20">
            <div className="relative group p-3 rounded-xl">
              {/* Glass background */}
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