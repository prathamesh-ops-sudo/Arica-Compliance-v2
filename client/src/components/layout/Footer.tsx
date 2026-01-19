import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Arica Toucan</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2026 Arica Toucan &ndash; Helping organizations achieve &amp; maintain ISO 27001/27002 compliance
          </p>
        </div>
      </div>
    </footer>
  );
}
