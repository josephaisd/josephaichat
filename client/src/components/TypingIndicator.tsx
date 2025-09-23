import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 p-4" data-testid="typing-indicator">
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className="bg-primary/10 text-primary">
          <span className="text-sm font-bold">J</span>
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col items-start">
        <div className="relative group p-4 rounded-2xl backdrop-blur-lg border bg-gradient-to-r from-primary/8 via-primary/4 to-accent/8 border-primary/20 rounded-tl-md">
          {/* Enhanced glass reflection effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none"></div>
          
          <div className="relative flex items-center gap-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
            </div>
          </div>
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-2">
          Joseph is thinking...
        </span>
      </div>
    </div>
  );
}