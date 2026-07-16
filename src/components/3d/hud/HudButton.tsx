"use client";

interface HudButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function HudButton({ id, icon, label, onClick }: HudButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={label}
      className="group relative flex size-14 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-secondary/50 hover:text-foreground"
    >
      {icon}
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}
