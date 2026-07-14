import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

const InfiniteWorld = dynamic(
  () => import("@/components/3d/InfiniteWorld"),
  {
    ssr: false,
    // Match the WorldLoader's resting state so the overlay appears seamless
    // while the component's own JS chunk is still downloading.
    loading: () => (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="absolute inset-x-0 top-1/2 h-px bg-foreground/15" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "3D World",
  description:
    "An infinite procedurally generated 3D world — explore terrain, sky, and nature in your browser.",
};

export default function ThreeDPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Back button */}
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-2 text-sm font-medium text-foreground/80 backdrop-blur-xl transition-all hover:bg-background/80 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      {/* Infinite world engine */}
      <InfiniteWorld className="h-full w-full" />
    </div>
  );
}
