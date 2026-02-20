"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period?: string;
  description?: string;
  responsibilities?: readonly string[];
}
export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
  responsibilities,
}: ResumeCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleClick = () => {
    if (description || (responsibilities && responsibilities.length > 0)) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className="block cursor-pointer"
      onClick={handleClick}
    >
      <Card className="flex w-full p-4 sm:p-5 overflow-hidden">
        <div className="flex-none">
          <Avatar className="border-2 size-14 m-auto bg-muted-background dark:bg-foreground">
            <AvatarImage
              src={logoUrl}
              alt={altText}
              className="object-contain"
            />
            <AvatarFallback>{altText[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0 ml-4 sm:ml-6 flex flex-col group">
          <CardHeader className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-2 text-sm leading-tight sm:leading-normal">
              <h3 className="inline-flex flex-wrap items-center justify-start font-semibold gap-y-1 gap-x-2 text-sm sm:text-base relative pr-6">
                {title}
                {badges && (
                  <span className="inline-flex gap-x-1">
                    {badges.map((badge, index) => (
                      <Badge
                        className="align-middle text-xs px-2 py-0.5"
                        key={index}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </span>
                )}
                <ChevronRightIcon
                  className={cn(
                    "size-4 absolute right-0 top-0.5 transition-all duration-300 ease-out group-hover:translate-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                    isExpanded ? "rotate-90" : "rotate-0",
                  )}
                />
              </h3>
              {period && (
                <div className="text-sm tabular-nums text-foreground/80 mt-1 sm:mt-0 sm:text-right font-medium">
                  {period}
                </div>
              )}
            </div>
            {subtitle && (
              <div className="font-sans text-sm text-foreground">
                {subtitle}
              </div>
            )}
          </CardHeader>
          {(description ||
            (responsibilities && responsibilities.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isExpanded ? 1 : 0,

                height: isExpanded ? "auto" : 0,
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-2 text-sm sm:text-base flex flex-col gap-2 overflow-hidden leading-relaxed text-foreground/80 w-full break-words"
            >
              {description && <div>{description}</div>}
              {responsibilities && responsibilities.length > 0 && (
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {responsibilities.map((responsibility, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground text-xs sm:text-sm"
                    >
                      {responsibility}
                    </li>
                  ))}
                </ul>
              )}
              {href && (
                <Link
                  href={href}
                  target="_blank"
                  className="underline cursor-pointer text-primary hover:text-primary/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {href}
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
};
