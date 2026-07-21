import type { Metadata } from "next";
import { DATA } from "@/data/resume";

export const metadata: Metadata = {
  title: "3D Experience",
  description: `An interactive 3D portfolio experience by ${DATA.name}, built with Three.js and React Three Fiber.`,
  alternates: {
    canonical: "/3d",
  },
  openGraph: {
    title: "3D Experience",
    description: `An interactive 3D portfolio experience by ${DATA.name}, built with Three.js and React Three Fiber.`,
    url: "/3d",
    type: "website",
  },
};

export default function ThreeDLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
