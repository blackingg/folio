"use client";

import { useEffect, useState } from "react";
import { Glasses } from "lucide-react";
import { HudButton } from "./HudButton";

// Shows only when the browser can run immersive-vr (Quest browser, desktop
// with the WebXR emulator, etc.) — navigator.xr is undefined on iOS Safari,
// so this renders nothing there.
export function VrButton({
  gameRef,
  isLoaded,
}: {
  gameRef: React.RefObject<any>;
  isLoaded: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [presenting, setPresenting] = useState(false);

  useEffect(() => {
    (navigator as any).xr
      ?.isSessionSupported?.("immersive-vr")
      .then((ok: boolean) => setSupported(ok))
      .catch(() => setSupported(false));
  }, []);

  useEffect(() => {
    const game = gameRef.current;
    if (!isLoaded || !game) return;
    game.onXRSessionChange = setPresenting;
    return () => {
      game.onXRSessionChange = () => {};
    };
  }, [isLoaded, gameRef]);

  if (!supported) return null;

  return (
    <HudButton
      id="hud-vr-toggle"
      icon={<Glasses className="size-5" />}
      label={presenting ? "Exit VR" : "Enter VR"}
      onClick={() => {
        const game = gameRef.current;
        if (!game) return;
        if (presenting) game.exitVR();
        else game.enterVR();
      }}
    />
  );
}
