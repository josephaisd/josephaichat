import { Bot, MessageCircle, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleGuestMode = () => {
    sessionStorage.setItem("guestMode", "true");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative">
        <header className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">J</span>
            </div>
            <h1 className="text-2xl font-bold">Joseph AI</h1>
          </div>
          <ThemeToggle />
        </header>

        <main className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Joseph AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your intelligent assistant powered by GPT-4o. Get instant answers, creative help, and intelligent conversation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Natural Conversation</h3>
                <p className="text-muted-foreground text-sm">
                  Chat naturally with an AI that understands context and provides helpful responses.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
                <p className="text-muted-foreground text-sm">
                  Get instant responses powered by the latest OpenAI technology.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                <p className="text-muted-foreground text-sm">
                  Your conversations are private and secure with authenticated accounts.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleLogin}
              className="min-w-[200px]"
              data-testid="button-login"
            >
              Sign In to Save Chats
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleGuestMode}
              className="min-w-[200px]"
              data-testid="button-guest"
            >
              Continue as Guest
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 max-w-md mx-auto">
            <span className="font-semibold">Guest mode:</span> Your chat history will not be saved and will be cleared when you refresh the page. 
            <span className="block mt-1">Sign in to save your conversations.</span>
          </p>
        </main>
      </div>
    </div>
  );
}
