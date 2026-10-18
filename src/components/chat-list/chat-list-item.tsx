"use client";

import { memo } from "react";
import { VolumeX } from "lucide-react";
import { TgAvatar } from "@/components/ui/tg-avatar";
import {
  DoubleCheckIcon,
  PinSlotIcon,
  SingleCheckIcon,
} from "@/components/ui/telegram-icons";
import { cn } from "@/lib/cn";

export interface ChatListItemProps {
  title: string;
  subtitle: string;
  timeLabel: string;
  unreadCount?: number;
  isActiveChat?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  isOutgoingRead?: boolean;
  isTyping?: boolean;
  avatarSeed?: string | number;
  colorOverride?: string | null;
  onClick: () => void;
  onContextMenuAction?: (action: "mute" | "pin") => void;
}

export const ChatListItem = memo(function ChatListItem({
  title,
  subtitle,
  timeLabel,
  unreadCount = 0,
  isActiveChat = false,
  isMuted = false,
  isPinned = false,
  isOutgoingRead = true,
  isTyping = false,
  avatarSeed,
  colorOverride,
  onClick,
}: ChatListItemProps) {
  return (
    <div className="px-2 py-0.5">
      <button
        type="button"
        role="option"
        aria-selected={isActiveChat}
        onClick={onClick}
        className={cn(
          "group relative flex min-h-[64px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors select-none cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tg-accent",
          isActiveChat
            ? "bg-tg-accent text-white"
            : "hover:bg-tg-hover"
        )}
      >
        <div className="relative shrink-0">
          <TgAvatar
            name={title}
            seed={avatarSeed ?? title}
            colorOverride={colorOverride}
            size="lg"
            className={cn(
              "transition-transform duration-150",
              isActiveChat && "ring-2 ring-white/30"
            )}
          />
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2",
              isActiveChat
                ? "border-sky-600 bg-emerald-400"
                : "border-tg-surface bg-emerald-500"
            )}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          {/* Top row: Name + mute icon + check + time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn(
                  "truncate text-[15px] font-bold leading-tight tracking-tight",
                  isActiveChat ? "text-white" : "text-tg-primary"
                )}
              >
                {title}
              </span>
              {isMuted && (
                <VolumeX
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActiveChat ? "text-white/80" : "text-tg-muted"
                  )}
                />
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center",
                  isActiveChat ? "text-white/90" : "text-tg-meta-out"
                )}
              >
                {isOutgoingRead ? <DoubleCheckIcon /> : <SingleCheckIcon />}
              </span>
              <time
                className={cn(
                  "text-[11px] font-medium leading-none",
                  isActiveChat ? "text-white/85" : "text-tg-muted"
                )}
              >
                {timeLabel}
              </time>
            </div>
          </div>

          {/* Bottom row: Last message / typing + unread badge / pin */}
          <div className="flex items-center justify-between gap-2">
            {isTyping ? (
              <span
                className={cn(
                  "truncate text-[13px] font-semibold",
                  isActiveChat ? "text-white" : "text-tg-accent"
                )}
              >
                sincronizzazione...
              </span>
            ) : (
              <p
                className={cn(
                  "truncate text-[13px] leading-snug",
                  isActiveChat ? "text-white/90" : "text-tg-muted"
                )}
              >
                {subtitle}
              </p>
            )}

            <div className="flex shrink-0 items-center gap-1.5">
              {isPinned && (
                <PinSlotIcon
                  className={cn(
                    "h-3.5 w-3.5",
                    isActiveChat ? "text-white/80" : "text-tg-muted/70"
                  )}
                />
              )}
              {unreadCount > 0 && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none",
                    isActiveChat
                      ? "bg-white text-sky-700"
                      : isMuted
                        ? "bg-tg-badge-muted text-white"
                        : "bg-tg-accent text-white"
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
});
