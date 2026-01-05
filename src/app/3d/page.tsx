"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home, Loader2, MousePointer2 } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import Scene from "@/components/3d/scene";
import { Router } from "wouter";

export default function Experience() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="flex flex-col min-h-screen">
      <section className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-8 max-w-3xl mx-auto">
        <BlurFade delay={0.1}>
          <div className="inline-block rounded-lg bg-foreground text-background px-4 py-1.5 text-sm font-medium mb-6">
            3D Portfolio Scene
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
            An Immersive <br /> Digital Space
          </h1>
        </BlurFade>

        <BlurFade delay={0.2}>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-[600px] leading-relaxed">
            Explore my work in a three-dimensional environment. Scroll down to
            enter the gallery and interact with the pieces by double-clicking
            them.
          </p>
        </BlurFade>

        <BlurFade delay={0.3}>
          <div className="flex flex-col items-center gap-4">
            <div className="mt-8">
              <div className="w-1 h-12 bg-gradient-to-b from-foreground to-transparent rounded-full animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
              Scroll to Explore
            </span>
          </div>
        </BlurFade>
      </section>

      <section className="relative w-full h-[80vh] sm:h-screen border-y bg-muted/30 overflow-hidden">
        {mounted ? (
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
                    Initializing Scene...
                  </p>
                </div>
              </div>
            }
          >
            <Router base="/3d">
              <Scene />
            </Router>
          </Suspense>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
                Preparing Scene...
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10 hidden sm:block">
          <BlurFade delay={1.5}>
            <div className="bg-background/80 backdrop-blur-md border px-5 py-2.5 rounded-full flex items-center gap-2.5 text-xs font-medium shadow-2xl">
              <MousePointer2 className="w-3.5 h-3.5" />
              <span>Double-click items to zoom in and explore</span>
            </div>
          </BlurFade>
        </div>
      </section>

      <section className="py-32 px-4 bg-background">
        <div className="max-w-4xl mx-auto space-y-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <BlurFade delay={0.1}>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">
                About this Scene
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                This immersive scene is crafted using React Three Fiber, Drei,
                and Three.js. It explores spatial portfolio interaction by using
                portals to bridge different digital dimensions.
              </p>
            </BlurFade>

            <div className="grid grid-cols-1 gap-6">
              <BlurFade delay={0.2}>
                <div className="space-y-3 p-8 rounded-3xl border bg-card transition-shadow">
                  <h3 className="font-bold text-lg">Spatial Discovery</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Each frame serves as a portal into a distinct artistic or
                    technical concept, complete with its own atmospheric
                    lighting and volume.
                  </p>
                </div>
              </BlurFade>
              <BlurFade delay={0.3}>
                <div className="space-y-3 p-8 rounded-3xl border bg-card transition-shadow">
                  <h3 className="font-bold text-lg">Interactive Portals</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Double-click any artwork to "step inside." Once inside, you
                    can return to the gallery using the back button.
                  </p>
                </div>
              </BlurFade>
            </div>
          </div>
        </div>
      </section>

      <div className="h-32" />
    </main>
  );
}
