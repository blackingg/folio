"use client";

import { cn } from "@/lib/utils";

export interface PanelTab {
  id: string;
  label: string;
}

interface PanelTabsProps {
  tabs: PanelTab[];
  active: string;
  onChange: (id: string) => void;
}

export function PanelTabs({ tabs, active, onChange }: PanelTabsProps) {
  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            active === tab.id
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
