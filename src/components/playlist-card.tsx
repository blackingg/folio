import { Icons } from "@/components/icons";
import Link from "next/link";

interface PlaylistCardProps {
  slug: string;
  title: string;
  postCount: number;
  images: string[];
}

export function PlaylistCard({
  slug,
  title,
  postCount,
  images,
}: PlaylistCardProps) {
  return (
    <Link
      href={`/blog/playlist/${slug}`}
      className="block group w-48 sm:w-56 shrink-0 snap-start  overflow-visible"
    >
      <div className="relative w-full aspect-[4/3] overflow-visible cursor-pointer">
        <Icons.folderBack className="absolute inset-0 w-full h-full z-0 drop-shadow-sm" />

        {/* Images Peeking Out */}
        <div className="absolute inset-x-0 top-3 flex justify-center z-10 overflow-visible">
          {images.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className={`absolute w-[80%] aspect-[4/3] rounded-lg overflow-hidden shadow-md transition-all duration-300 origin-bottom
                  ${i === 0 ? "group-hover:-translate-y-2" : ""}
                  ${i === 1 ? "rotate-3 group-hover:-translate-y-6 group-hover:rotate-6" : ""}
                  ${i === 2 ? "-rotate-3 group-hover:-translate-y-8 group-hover:-rotate-6" : ""}
                `}
              style={{
                zIndex: images.length - i,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                className="object-cover w-full h-full"
                alt=""
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          ))}
        </div>

        <Icons.folderFront className="absolute inset-0 w-full h-full z-20 pointer-events-none drop-shadow-md" />

        <div className="absolute bottom-3 left-4 right-4 z-30 flex justify-between items-end text-foreground pointer-events-none">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="capitalize font-bold text-sm leading-tight truncate">
              {title}
            </h3>
          </div>
          <span className="text-[10px] text-xs font-medium bg-foreground/10 px-2 py-0.5 rounded-full shrink-0">
            {postCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
