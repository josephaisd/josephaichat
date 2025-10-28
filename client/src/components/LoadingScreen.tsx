import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowWelcome(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    const timer3 = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-1000 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
      
      {/* Main login container */}
      <div className="relative z-10 text-center">
        {/* User Avatar */}
        <div className="flex justify-center mb-6">
          <Avatar className="w-32 h-32 border-4 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-4xl font-bold text-primary">
              J
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Username */}
        <h2 className="text-3xl font-semibold mb-8 text-foreground">
          Joseph AI
        </h2>

        {/* Loading state */}
        {!showWelcome ? (
          <div className="flex flex-col items-center gap-4" data-testid="status-loading">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Signing in...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500" data-testid="status-welcome">
            <p className="text-lg text-foreground">Welcome</p>
          </div>
        )}
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground">Joseph AI Assistant</p>
      </div>
    </div>
  );
}
