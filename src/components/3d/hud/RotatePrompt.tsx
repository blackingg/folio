"use client";

import { Smartphone } from "lucide-react";

// Shown over everything (even the loader) while a mobile device is in
// portrait — the world's controls and HUD are laid out for landscape.
export function RotatePrompt() {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <style>{`
        @keyframes rp-rotate {
          0%, 15% { transform: rotate(0deg); }
          45%, 70% { transform: rotate(-90deg); }
          100% { transform: rotate(-90deg); }
        }
      `}</style>
      <Smartphone
        className="h-16 w-16 text-foreground"
        style={{ animation: "rp-rotate 1.8s ease-in-out infinite" }}
      />
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          Rotate your device
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Project TRUMAN is built for landscape — turn your phone sideways to
          play.
        </p>
      </div>
    </div>
  );
}
