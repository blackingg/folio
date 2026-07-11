"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HudButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export function HudButton({ id, icon, label, active, onClick }: HudButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={label}
      className={cn(
        "group relative",
        buttonVariants({ variant: active ? "default" : "secondary", size: "icon" }),
        "size-14 rounded-lg"
      )}
    >
      {icon}
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}
