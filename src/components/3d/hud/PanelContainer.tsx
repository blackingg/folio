"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface PanelContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function PanelContainer({
  children,
  title,
  subtitle,
  onClose,
}: PanelContainerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ pointerEvents: "none" }}
    >
      <div
        className={cn(
          "relative w-full max-w-lg rounded-lg border border-border bg-card text-card-foreground shadow-lg",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
        style={{
          animation: "slideUp 250ms cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "auto",
        }}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-6 h-px bg-border" />

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
