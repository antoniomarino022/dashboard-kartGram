"use client";

import { memo } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Copy,
  Forward,
  Pencil,
  Pin,
  Trash2,
} from "lucide-react";
import { TgAvatar } from "@/components/ui/tg-avatar";
import {
  DoubleCheckIcon,
  PinSlotIcon,
  ReplyArrowIcon,
  SingleCheckIcon,
} from "@/components/ui/telegram-icons";
import { UnlockType } from "@/types/api";
import { getAvatarColor } from "@/lib/avatar-color";
import { cn, UNLOCK_TYPE_META } from "@/lib/utils";

export interface MessageBubbleProps {
  id: number;
  title: string;
  senderLabel: string;
  unlockType: UnlockType;
  unlockValue: number;
  isActive: boolean;
  timeLabel: string;
  isOutgoing?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  isSelected?: boolean;
  isInspected?: boolean;
  isPinned?: boolean;
  colorSwatch?: string | null;
  replyQuote?: {
    title: string;
    subtitle: string;
  } | null;
  forwardedFrom?: string | null;
  children?: React.ReactNode;
  onSelectToggle: (id: number) => void;
  onInspect: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onReply: (id: number) => void;
  onPinToggle: (id: number) => void;
  onCopyJson: (id: number) => void;
  onDuplicate?: (id: number) => void;
}

export const MessageBubble = memo(function MessageBubble({
  id,
  title,
  senderLabel,
  unlockType,
  unlockValue,
  isActive,
  timeLabel,
  isOutgoing = false,
  isFirstInGroup = true,
  isLastInGroup = true,
  isSelected = false,
  isInspected = false,
  isPinned = false,
  colorSwatch,
  replyQuote,
  forwardedFrom,
  children,
  onSelectToggle,
  onInspect,
  onEdit,
  onDelete,
  onReply,
  onPinToggle,
  onCopyJson,
  onDuplicate,
}: MessageBubbleProps) {
  const unlockMeta =
    UNLOCK_TYPE_META[unlockType] ?? UNLOCK_TYPE_META[UnlockType.FREE];
  const senderColor = getAvatarColor(senderLabel).bg;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey) {
              onSelectToggle(id);
              return;
            }
            onInspect(id);
          }}
          className={cn(
            "group relative flex w-full items-end gap-2 px-2.5 py-1 transition-colors select-none cursor-pointer sm:px-4",
            isOutgoing ? "justify-end" : "justify-start",
            isSelected && "bg-tg-selected",
            isInspected && !isSelected && "bg-tg-accent-soft/40"
          )}
        >
          {/* Incoming Avatar on desktop/tablet */}
          {!isOutgoing && (
            <div className="hidden w-9 shrink-0 sm:block">
              {isLastInGroup && (
                <TgAvatar
                  name={title}
                  seed={`${senderLabel}-${id}`}
                  colorOverride={colorSwatch}
                  size="sm"
                />
              )}
            </div>
          )}

          {/* Bubble container */}
          <div
            className={cn(
              "relative w-full max-w-[94%] rounded-2xl px-3.5 pt-2.5 pb-2 text-[14px] leading-relaxed text-tg-primary transition-colors sm:w-auto sm:min-w-[280px] sm:max-w-[540px]",
              isOutgoing
                ? "bg-tg-bubble-out border border-sky-200 dark:border-sky-900/50"
                : "bg-tg-bubble-in border border-tg-border",
              !isOutgoing && isLastInGroup && "rounded-bl-xs",
              isOutgoing && isLastInGroup && "rounded-br-xs",
              isInspected &&
                "ring-1 ring-tg-accent border-tg-accent/60"
            )}
          >
            {/* Sender header */}
            {isFirstInGroup && (
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span
                  className="inline-flex items-center gap-1.5 truncate text-[12px] font-bold tracking-wide"
                  style={{ color: senderColor }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: senderColor }}
                  />
                  {senderLabel}
                </span>
                <span className="rounded-full bg-black/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-tg-muted dark:bg-white/10">
                  #{id}
                </span>
              </div>
            )}

            {/* Forwarded label */}
            {forwardedFrom && (
              <div className="mb-1 text-[12px] font-semibold text-tg-accent">
                ↪ Inoltrato da {forwardedFrom}
              </div>
            )}

            {/* Reply quote with colored vertical bar */}
            {replyQuote && (
              <div
                className="mb-2 rounded-[10px] py-1.5 pl-3 pr-2.5 text-[12px]"
                style={{
                  backgroundColor: unlockMeta.softBgVar,
                  borderLeft: `3px solid ${unlockMeta.accentVar}`,
                }}
              >
                <div
                  className="truncate font-bold"
                  style={{ color: unlockMeta.accentVar }}
                >
                  {replyQuote.title}
                </div>
                <div className="truncate text-tg-muted">
                  {replyQuote.subtitle}
                </div>
              </div>
            )}

            {/* Main item title + optional color preview swatch + quick actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                {colorSwatch && (
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border-2 border-white/40 shadow-sm"
                    style={{ backgroundColor: colorSwatch }}
                    title={`Colore ${colorSwatch}`}
                  />
                )}
                <span className="truncate text-[16px] font-bold tracking-tight text-tg-primary">
                  {title}
                </span>
              </div>

              {/* Quick inline edit/delete buttons (always visible on mobile, hover on desktop) */}
              <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(id);
                  }}
                  title="Modifica elemento"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-tg-secondary/80 text-tg-accent transition-colors hover:bg-tg-accent hover:text-white cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                  title="Elimina elemento"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-tg-danger-soft text-tg-danger transition-colors hover:bg-tg-danger hover:text-white cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Extra structured attributes passed by manager */}
            {children && <div className="mt-1">{children}</div>}

            {/* Reactions / Status pills + Bottom-right metadata */}
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-1">
              {/* Telegram reaction pills below message content */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-2xs"
                  style={{
                    backgroundColor: unlockMeta.softBgVar,
                    color: unlockMeta.accentVar,
                  }}
                >
                  <span>{unlockMeta.shortLabel}</span>
                  {unlockType !== UnlockType.FREE && (
                    <span className="font-mono font-extrabold">
                      {unlockValue.toLocaleString("it-IT")}
                    </span>
                  )}
                </span>

                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{
                    backgroundColor: isActive
                      ? "var(--tg-success-soft)"
                      : "var(--tg-bg-hover)",
                    color: isActive
                      ? "var(--tg-success)"
                      : "var(--tg-text-secondary)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: isActive
                        ? "var(--tg-success)"
                        : "var(--tg-text-secondary)",
                    }}
                  />
                  {isActive ? "Attivo" : "Inattivo"}
                </span>

                {isPinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                    <PinSlotIcon className="h-3 w-3" />
                    Fissato
                  </span>
                )}
              </div>

              {/* Bottom-right timestamp + edited + double-check */}
              <div className="ml-auto flex shrink-0 items-center gap-1 select-none">
                <span className="text-[10px] font-medium text-tg-muted/80">
                  sync
                </span>
                <time className="text-[11px] font-medium leading-none text-tg-muted">
                  {timeLabel}
                </time>
                <span
                  className={cn(
                    "inline-flex items-center",
                    isActive ? "text-tg-meta-out" : "text-tg-muted"
                  )}
                  title={
                    isActive
                      ? "Elemento attivo nel catalogo"
                      : "Elemento disattivato"
                  }
                >
                  {isActive ? <DoubleCheckIcon /> : <SingleCheckIcon />}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </ContextMenu.Trigger>

      {/* Telegram Web K/A Context Menu on Right Click */}
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-[200px] rounded-[14px] border border-tg-border bg-tg-surface/95 p-1.5 text-[14px] text-tg-primary shadow-2xl backdrop-blur-xl">
          <ContextMenu.Item
            onSelect={() => onReply(id)}
            className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 outline-none transition-colors hover:bg-tg-hover cursor-pointer"
          >
            <ReplyArrowIcon className="h-4 w-4 text-tg-accent" />
            <span>Reply / Cita</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            onSelect={() => onEdit(id)}
            className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 outline-none transition-colors hover:bg-tg-hover cursor-pointer"
          >
            <Pencil className="h-4 w-4 text-amber-400" />
            <span>Edit / Modifica</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            onSelect={() => onCopyJson(id)}
            className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 outline-none transition-colors hover:bg-tg-hover cursor-pointer"
          >
            <Copy className="h-4 w-4 text-cyan-400" />
            <span>Copy JSON</span>
          </ContextMenu.Item>

          {onDuplicate && (
            <ContextMenu.Item
              onSelect={() => onDuplicate(id)}
              className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 outline-none transition-colors hover:bg-tg-hover cursor-pointer"
            >
              <Forward className="h-4 w-4 text-purple-400" />
              <span>Forward / Duplica</span>
            </ContextMenu.Item>
          )}

          <ContextMenu.Item
            onSelect={() => onPinToggle(id)}
            className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 outline-none transition-colors hover:bg-tg-hover cursor-pointer"
          >
            <Pin className="h-4 w-4 text-emerald-400" />
            <span>{isPinned ? "Unpin" : "Pin"}</span>
          </ContextMenu.Item>

          <ContextMenu.Item
            onSelect={() => onSelectToggle(id)}
            className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 outline-none transition-colors hover:bg-tg-hover cursor-pointer"
          >
            <CheckSquare className="h-4 w-4 text-tg-muted" />
            <span>{isSelected ? "Deselect" : "Select"}</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-tg-border" />

          <ContextMenu.Item
            onSelect={() => onDelete(id)}
            className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 font-medium text-tg-danger outline-none transition-colors hover:bg-tg-danger-soft cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
});
