"use client";

import { useState } from "react";

export function BlogImage({
  src,
  alt,
}: {
  src: string | undefined | null;
  alt: string;
}) {
  const [error, setError] = useState(false);

  if (error || !src) return null;

  return (
    <div className="relative w-full h-56 overflow-hidden">
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}
