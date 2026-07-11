"use client";

import { PanelBackdrop } from "./PanelBackdrop";
import { PanelContainer } from "./PanelContainer";
import { WorldMap } from "./map/WorldMap";

interface MapPanelProps {
  onClose: () => void;
  gameRef: React.RefObject<any>;
  isLoaded: boolean;
}

export function MapPanel({ onClose, gameRef, isLoaded }: MapPanelProps) {
  return (
    <>
      <PanelBackdrop onClose={onClose} />
      <PanelContainer
        title="World Map"
        subtitle="Topographic view — hover or click a location for details"
        onClose={onClose}
      >
        <div className="mx-auto w-full max-w-[min(100%,560px)] overflow-hidden rounded-lg border border-border">
          <WorldMap
            gameRef={gameRef}
            isLoaded={isLoaded}
            size={520}
            mode="full"
          />
        </div>
      </PanelContainer>
    </>
  );
}
