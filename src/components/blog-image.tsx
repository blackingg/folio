"use client";

import { useState } from "react";

export function BlogImage({
  src,
  alt,
  compact = false,
}: {
  src: string | undefined | null;
  alt: string;
  compact?: boolean;
}) {
  const [error, setError] = useState(false);

  if (error || !src) return null;

  if (compact) {
    return (
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md sm:size-16">
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

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
