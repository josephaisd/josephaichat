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
    }, 1800);

    const timer2 = setTimeout(() => {
      setFadeOut(true);
    }, 3800);

    const timer3 = setTimeout(() => {
      onComplete();
    }, 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-700 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      
      {/* Main login container */}
      <div className="relative z-10 text-center">
        {/* User Avatar with glass effect */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            {/* Glass background for avatar */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-full blur-xl opacity-60"></div>
            <Avatar className="w-36 h-36 border-4 border-primary/30 shadow-2xl relative">
              <AvatarFallback className="bg-gradient-to-br from-primary/40 to-accent/20 text-5xl font-bold text-primary">
                J
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Username */}
        <h2 className="text-4xl font-semibold mb-10 text-foreground tracking-tight">
          Joseph AI
        </h2>

        {/* Loading state */}
        {!showWelcome ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300" data-testid="status-loading">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-base text-muted-foreground">Signing in...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500" data-testid="status-welcome">
            <p className="text-2xl text-foreground font-medium">Welcome</p>
          </div>
        )}
      </div>

      {/* Bottom text with glass effect */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-lg backdrop-blur-sm border border-primary/20"></div>
          <div className="relative px-6 py-3">
            <p className="text-sm text-muted-foreground font-medium">Joseph AI Assistant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
