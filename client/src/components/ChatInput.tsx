import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Ask Joseph anything..." 
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/20 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[52px] max-h-32 resize-none bg-card/60 backdrop-blur-sm border-border/30 rounded-2xl pr-20 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
              data-testid="input-message"
            />
            
            {/* Glass reflection effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/3 to-transparent pointer-events-none"></div>
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-voice-input"
                onClick={() => console.log('Voice input triggered')}
              >
                <Mic className="w-4 h-4" />
              </Button>
              
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || disabled}
                className="h-8 w-8 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 px-2">
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
          <p className="text-xs text-muted-foreground">
            {message.length}/2000
          </p>
        </div>
      </form>
    </div>
  );
}