import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />

      <Card className="w-full max-w-md mx-4 relative" data-testid="card-not-found">
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-destructive" data-testid="icon-alert" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-error-title">
                67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-error-message">
               67 67 67 67 67 67 67 67 67 67 67 67 67 67 67
              </p>
            </div>
          </div>

          <Button className="w-full gap-2" asChild data-testid="button-go-home">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go back to home you little 67
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
