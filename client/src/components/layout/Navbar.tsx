import { Link, useLocation } from "wouter";
import { Shield, Menu, X, LogIn, ClipboardList, FileCheck, BarChart3, LayoutDashboard, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

const navLinks = [
  { href: "/login", label: "Login", icon: LogIn },
  { href: "/questionnaire/user", label: "User Questionnaire", icon: ClipboardList },
  { href: "/questionnaire/provider", label: "Provider Questionnaire", icon: FileCheck },
  { href: "/report-preview", label: "Report Preview", icon: BarChart3 },
  { href: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1.5">
            <Shield className="h-7 w-7 text-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-foreground" data-testid="text-brand">Arica Toucan</span>
              <span className="text-xs text-muted-foreground leading-tight hidden sm:block">ISO 27001/27002 Compliance</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive && "bg-primary/10 text-primary"
                    )}
                    data-testid={`nav-${link.href.replace(/\//g, '-').slice(1)}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{link.label}</span>
                  </Button>
                </Link>
              );
            })}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="mr-1 lg:hidden"
              data-testid="button-theme-toggle-mobile"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-mobile-menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden pb-4 border-t pt-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.href;
                return (
                  <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive && "bg-primary/10 text-primary"
                      )}
                      data-testid={`mobile-nav-${link.href.replace(/\//g, '-').slice(1)}`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
