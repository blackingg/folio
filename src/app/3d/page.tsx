"use client";
import { Suspense } from "react";
import Link from "next/link";
import { Home, Loader2 } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import Scene from "@/components/3d/scene";

export default function Experience() {
  return (
    <main className="flex flex-col items-center justify-center p-4 text-center space-y-8">
      <Suspense
        fallback={
          <div className="w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <Scene />
      </Suspense>

      <BlurFade delay={0.4}>
        <Link href="/">
          <Button className="gap-2">
            <Home className="size-4" />
            Return Home
          </Button>
        </Link>
      </BlurFade>
    </main>
  );
}
