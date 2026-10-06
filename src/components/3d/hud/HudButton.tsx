"use client";

interface HudButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  small?: boolean;
  active?: boolean;
}

export function HudButton({ id, icon, label, onClick, small, active }: HudButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={label}
      className={`group relative flex items-center justify-center rounded-lg border transition-all ${small ? "size-11" : "size-14"} ${
        active
          ? "-translate-x-1 border-[hsl(var(--neon)/50%)] bg-secondary text-foreground shadow-lg shadow-[hsl(var(--neon)/10%)]"
          : "border-border bg-card text-muted-foreground shadow-sm hover:bg-secondary/50 hover:text-foreground"
      }`}
    >
      {icon}
      {active && (
        <span className="absolute -left-2 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[hsl(var(--neon))]" />
      )}
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}
