import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Home, Target, Zap } from "lucide-react";
import { Link } from "wouter";

export default function SixtySevenPage() {
  return (
    <div className="min-h-screen w-full bg-background overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none animate-pulse" />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-3xl bg-primary/30 animate-pulse" />
            <h1 className="relative text-9xl md:text-[12rem] font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent" data-testid="text-67">
              67🤷‍♂️
            </h1>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary" data-testid="text-secret-found">
                You found the secret page!
              </span>
            </div>

            <p className="text-2xl md:text-3xl text-foreground font-semibold" data-testid="text-congratulations">
              Did you just say 67....
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-description">
              You discovered the hidden 67 page. This special number unlocks a secret part of Joseph AI.

            </p>
          </div>

          
                
        

          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <Button size="lg" variant="default" className="gap-2" asChild data-testid="button-back-chat">
              <Link href="/chat">
                <Sparkles className="h-5 w-5" />
                Back to Chat
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild data-testid="button-go-home">
              <Link href="/">
                <Home className="h-5 w-5" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
