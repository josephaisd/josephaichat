import { Bot, PanelLeftClose, PanelLeft, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen = false }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();

  const handleLogout = () => {
    sessionStorage.removeItem("guestMode");
    window.location.href = "/api/logout";
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "G";
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
                  Intelligent Assistant
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Theme Toggle and User Menu */}
        <div className="flex items-center gap-2 justify-end">
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.email && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-header"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}