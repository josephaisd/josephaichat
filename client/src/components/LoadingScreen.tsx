import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentText, setCurrentText] = useState("Hello Joseph");
  const [showDots, setShowDots] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentText("Hello Joseph AI");
    }, 2000);

    const timer2 = setTimeout(() => {
      setShowDots(true);
    }, 3000);

    const timer3 = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-1000 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Animated background gradient - similar to Windows */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent"></div>
      
      {/* Subtle moving particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-bounce" style={{
          left: '20%',
          top: '30%',
          animationDelay: '0s',
          animationDuration: '3s'
        }}></div>
        <div className="absolute w-1 h-1 bg-accent/30 rounded-full animate-bounce" style={{
          left: '70%',
          top: '60%',
          animationDelay: '1s',
          animationDuration: '4s'
        }}></div>
        <div className="absolute w-1.5 h-1.5 bg-primary/15 rounded-full animate-bounce" style={{
          left: '80%',
          top: '20%',
          animationDelay: '2s',
          animationDuration: '5s'
        }}></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 text-center">
        {/* Liquid glass container for text */}
        <div className="relative group mb-8">
          {/* Glass background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/8 to-accent/15 rounded-3xl backdrop-blur-lg border border-primary/25 shadow-2xl"></div>
          
          {/* Glass reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/8 to-transparent rounded-3xl"></div>
          
          {/* Animated shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-3xl animate-pulse"></div>
          
          {/* Text content */}
          <div className="relative px-12 py-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent tracking-tight transition-all duration-1000">
              {currentText}
            </h1>
          </div>
        </div>

        {/* Loading dots - Windows style */}
        {showDots && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
            <div className="w-3 h-3 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
            <div className="w-3 h-3 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
