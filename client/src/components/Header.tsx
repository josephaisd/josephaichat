import { PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen = false }: HeaderProps) {

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between p-4">
        {/* Left side - Sidebar toggle button */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            {/* Glass button background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-primary/4 to-accent/8 rounded-xl backdrop-blur-sm border border-primary/15 shadow-md"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/4 to-transparent rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              data-testid="button-toggle-sidebar"
              className="relative bg-transparent hover:bg-transparent border-0 w-10 h-10"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5 text-primary" />
              ) : (
                <PanelLeft className="w-5 h-5 text-primary" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Center - Joseph AI Title with Liquid Glass Effect - Properly centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative group">
            {/* Liquid glass background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl backdrop-blur-sm border border-primary/20 shadow-lg"></div>
            
            {/* Glass reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl"></div>
            
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            
            {/* Content */}
            <div className="relative flex items-center gap-3 px-6 py-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">J</span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-background animate-pulse"></div>
              </div>
              
              <div className="text-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent tracking-tight">
                  Joseph AI
                </h1>
                <p className="text-xs text-muted-foreground font-medium tracking-wide">
                  Intelligent Assistant
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Theme Toggle */}
        <div className="flex items-center gap-2 justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}