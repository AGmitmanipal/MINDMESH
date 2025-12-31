import { Link } from "react-router-dom";
import { Menu, X, Shield, ShieldAlert, CheckCircle2, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useExtension } from "@/hooks/useExtension";
import { useTheme } from "@/hooks/useTheme";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAvailable, isChecking } = useExtension();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-lg font-black shadow-sm group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none text-slate-900 dark:text-white">CORTEX</span>
              <span className="text-[9px] font-bold tracking-wider text-primary uppercase">Web Helper</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {isChecking ? (
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              ) : isAvailable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {isChecking ? "Checking..." : isAvailable ? "Connected" : "Disconnected"}
              </span>
            </div>
            
            <Link
              to="/"
              className="text-sm font-semibold text-slate-500 hover:text-primary transition-all"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-slate-500 hover:text-primary transition-all"
            >
              Dashboard
            </Link>
            <Link
              to="/privacy"
              className="text-sm font-semibold text-slate-500 hover:text-primary transition-all"
            >
              Privacy
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              )}
            </button>
            <Link 
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow-sm"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/privacy"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Privacy
            </Link>
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  Dark Mode
                </>
              )}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
