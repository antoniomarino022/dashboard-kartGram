"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import {
  CarFront,
  CircleDot,
  MapPin,
  Palette,
  Users,
  Zap,
} from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/avatar-color";
import { cn } from "@/lib/cn";

interface TgAvatarProps {
  name: string;
  seed?: string | number;
  colorOverride?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-9 w-9 text-[13px]",
  md: "h-[42px] w-[42px] text-[15px]",
  lg: "h-[52px] w-[52px] text-[17px]",
} as const;

const ICON_SIZE_MAP = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

const CHANNEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cars: CarFront,
  characters: Users,
  maps: MapPin,
  paints: Palette,
  wheels: CircleDot,
  powerups: Zap,
};

export function TgAvatar({
  name,
  seed,
  colorOverride,
  size = "md",
  className,
}: TgAvatarProps) {
  const seedKey = String(seed ?? name).toLowerCase();
  const palette = getAvatarColor(seed ?? name);
  const initials = getInitials(name);
  const ChannelIcon = CHANNEL_ICONS[seedKey];

  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-bold tracking-tight shadow-sm ring-1 ring-white/15",
        SIZE_MAP[size],
        className
      )}
      style={
        colorOverride
          ? {
              backgroundColor: colorOverride,
              color: "#FFFFFF",
            }
          : {
              backgroundImage: palette.gradient,
              backgroundColor: palette.bg,
              color: palette.text,
            }
      }
    >
      <AvatarPrimitive.Fallback
        delayMs={0}
        className="flex items-center justify-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
      >
        {ChannelIcon && !colorOverride ? (
          <ChannelIcon className={ICON_SIZE_MAP[size]} />
        ) : (
          initials
        )}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
