import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative group">
      {/* Liquid glass background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-primary/4 to-accent/8 rounded-xl backdrop-blur-sm border border-primary/15 shadow-md"></div>
      
      {/* Glass reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/4 to-transparent rounded-xl"></div>
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        data-testid="button-theme-toggle"
        className="relative bg-transparent hover:bg-transparent border-0 w-10 h-10"
      >
        <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
        <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}