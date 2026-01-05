"use client";
import Link from "next/link";
import { Home, Loader2 } from "lucide-react";
import React, { Suspense } from "react";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Button } from "@/components/ui/button";
import { Scene } from "@/components/scene";

export default function Experience() {
  return (
    <main className="flex flex-col items-center justify-center p-4 text-center space-y-8">
      <div className="space-y-4 max-w-[600px]">
        <BlurFade delay={0.1}>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
            Under Construction
          </h1>
        </BlurFade>

        <BlurFadeText
          className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
          delay={0.2}
          text="I'm currently building a comprehensive 3D portfolio experience here. It's not quite ready yet, but you can have a little fun while waiting by clicking the shape below to change its form and color!"
        />
      </div>

      <BlurFade
        delay={0.3}
        className="w-full max-w-2xl"
      >
        <Suspense
          fallback={
            <div className="aspect-video w-full flex items-center justify-center rounded-xl border bg-background/50 shadow-xl">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <Scene />
        </Suspense>
      </BlurFade>

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
