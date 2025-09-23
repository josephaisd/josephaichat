import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 p-4" data-testid="typing-indicator">
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col items-start">
        <div className="relative p-4 rounded-2xl backdrop-blur-lg border bg-card/60 border-border/30 rounded-tl-md">
          <div className="flex items-center gap-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
            </div>
          </div>
          
          {/* Glass reflection effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-2">
          Joseph is thinking...
        </span>
      </div>
    </div>
  );
}