import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: string;
  isAI?: boolean;
  timestamp?: string;
  imageUrl?: string;
}

export default function MessageBubble({ message, isAI = false, timestamp, imageUrl }: MessageBubbleProps) {
  return (
    <div className={`flex gap-3 p-4 ${isAI ? '' : 'flex-row-reverse'}`} data-testid={`message-${isAI ? 'ai' : 'user'}`}>
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className={`${isAI ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-secondary-foreground'}`}>
          {isAI ? <span className="text-sm font-bold">J</span> : <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[80%] ${isAI ? 'items-start' : 'items-end'}`}>
        <div className={`relative group p-4 rounded-2xl backdrop-blur-lg border ${
          isAI 
            ? 'bg-gradient-to-r from-primary/8 via-primary/4 to-accent/8 border-primary/20 rounded-tl-md' 
            : 'bg-gradient-to-r from-accent/8 via-primary/4 to-primary/8 border-primary/20 rounded-tr-md'
        }`}>
          {/* Enhanced glass reflection effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none"></div>
          
          {/* Subtle shimmer on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Message attachment" 
              className="relative max-w-full max-h-64 rounded-lg mb-2"
              data-testid="message-image"
            />
          )}
          
          {message && (
            <p className={`relative text-sm leading-relaxed ${isAI ? 'text-foreground' : 'text-foreground'}`}>
              {message}
            </p>
          )}
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