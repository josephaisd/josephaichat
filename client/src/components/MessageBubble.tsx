import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: string;
  isAI?: boolean;
  timestamp?: string;
}

export default function MessageBubble({ message, isAI = false, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex gap-3 p-4 ${isAI ? '' : 'flex-row-reverse'}`} data-testid={`message-${isAI ? 'ai' : 'user'}`}>
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className={`${isAI ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-secondary-foreground'}`}>
          {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[80%] ${isAI ? 'items-start' : 'items-end'}`}>
        <div className={`relative p-4 rounded-2xl backdrop-blur-lg border ${
          isAI 
            ? 'bg-card/60 border-border/30 rounded-tl-md' 
            : 'bg-primary/10 border-primary/20 rounded-tr-md'
        }`}>
          <p className={`text-sm leading-relaxed ${isAI ? 'text-foreground' : 'text-foreground'}`}>
            {message}
          </p>
          
          {/* Glass reflection effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        </div>
        
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-2">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}