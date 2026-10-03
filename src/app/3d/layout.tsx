import type { Metadata } from "next";
import { DATA } from "@/data/resume";

export const metadata: Metadata = {
  title: "Project TRUMAN",
  description: `Project TRUMAN — an infinite, procedurally generated 3D world by ${DATA.name}..`,
  alternates: {
    canonical: "/3d",
  },
  openGraph: {
    title: "Project TRUMAN",
    description: `Project TRUMAN — an infinite, procedurally generated 3D world by ${DATA.name}.`,
    url: "/3d",
    type: "website",
    images: [
      {
        url: "/truman.png",
        width: 1200,
        height: 630,
        alt: "Project TRUMAN",
      },
    ],
  },
  twitter: {
    title: "Project TRUMAN",
    card: "summary_large_image",
    description: `Project TRUMAN — an infinite, procedurally generated 3D world by ${DATA.name}.`,
    images: "/truman.png",
  },
};

export default function ThreeDLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
