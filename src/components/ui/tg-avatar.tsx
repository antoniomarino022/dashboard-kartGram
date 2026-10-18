"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { getInitials } from "@/lib/avatar-color";
import { cn } from "@/lib/cn";

interface TgAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-9 w-9 text-sm",
  md: "h-[42px] w-[42px] text-base",
  lg: "h-[52px] w-[52px] text-lg",
} as const;

/** Iniziali su fondo giallo tenue, uguale per tutti: niente gradienti arcobaleno. */
export function TgAvatar({ name, size = "md", className }: TgAvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-tg-accent-soft font-bold tracking-tight text-tg-accent-ink ring-1 ring-tg-border",
        SIZE_MAP[size],
        className
      )}
    >
      <AvatarPrimitive.Fallback delayMs={0} className="flex items-center justify-center">
        {getInitials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
