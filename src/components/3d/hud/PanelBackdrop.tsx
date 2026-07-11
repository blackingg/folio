"use client";

export function PanelBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
      style={{ animation: "fadeIn 200ms ease" }}
      onClick={onClose}
    />
  );
}
