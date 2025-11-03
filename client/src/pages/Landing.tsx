import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Sparkles, Image, Zap } from "lucide-react";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        
      <div className="relative">
        <header className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" data-testid="icon-logo" />
            </div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-app-name">Joseph AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" asChild data-testid="button-header-start">
              <Link href="/auth">
                Get Started
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center space-y-8 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary" data-testid="text-badge">
                Powered by JAI-V1
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold text-foreground max-w-4xl mx-auto leading-tight" data-testid="text-hero-title">
              Your Intelligent AI Assistant
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-hero-subtitle">
              Chat with advanced AI, share images, and get instant responses. 
              All your conversations saved automatically on your device.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" variant="default" className="gap-2" asChild data-testid="button-start-chatting">
                <Link href="/chat">
                  <MessageSquare className="h-5 w-5" />
                  Start Chatting
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-elevate" data-testid="card-feature-conversations">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Smart Conversations</h3>
                <p className="text-muted-foreground">
                  Have natural conversations with JAI-V1. Ask questions, get explanations, and explore ideas together.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-feature-images">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Image Support</h3>
                <p className="text-muted-foreground">
                  Upload or paste images directly into the chat. AI can analyze and discuss visual content with you.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-feature-fast">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  All data stored locally on your device. No login required, instant access, complete privacy.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="py-12 text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-footer">
            Built with modern AI technology • No account required • Privacy-first design
          </p>
        </footer>
      </div>
    </div>
  );
}
