import { PanelLeftClose, PanelLeft, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen = false }: HeaderProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const getDisplayName = () => {
    if (!user) return '';
    return user.username || 'User';
  };
  
  const getInitials = () => {
    if (!user) return 'G';
    return user.username ? user.username.substring(0, 2).toUpperCase() : 'U';
  };

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
                  
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - User menu and Theme Toggle */}
        <div className="flex items-center gap-2 justify-end">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full"
                      data-testid="button-user-menu"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      fetch('/api/logout', { method: 'POST', credentials: 'include' })
                        .then(() => window.location.reload());
                    }} data-testid="button-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-primary/4 to-accent/8 rounded-xl backdrop-blur-sm border border-primary/15 shadow-md"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/4 to-transparent rounded-xl"></div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.location.href = '/auth'}
                    className="relative bg-transparent hover:bg-transparent border-0 gap-2"
                    data-testid="button-login"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="font-medium">Log in</span>
                  </Button>
                </div>
              )}
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}