"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, SendHorizontal, Smile, X } from "lucide-react";
import { PaperclipIcon, ReplyArrowIcon } from "@/components/ui/telegram-icons";
import { useDraftsStore } from "@/stores/drafts";
import { UnlockType } from "@/types/api";
import { UNLOCK_TYPE_META } from "@/lib/utils";

interface CatalogComposerProps {
  sectionKey: string;
  placeholder: string;
  replyTarget?: {
    id: number;
    title: string;
    subtitle: string;
  } | null;
  onCancelReply: () => void;
  onQuickSubmit: (text: string) => void;
  onOpenFullCreate: (prefillText?: string) => void;
  onQuickPresetSelect?: (presetValue: string) => void;
  presets?: string[];
}

export function CatalogComposer({
  sectionKey,
  placeholder,
  replyTarget,
  onCancelReply,
  onQuickSubmit,
  onOpenFullCreate,
  onQuickPresetSelect,
  presets = Object.values(UnlockType),
}: CatalogComposerProps) {
  const draftText = useDraftsStore(
    (state) => state.composerDrafts[sectionKey] ?? ""
  );
  const setComposerDraft = useDraftsStore((state) => state.setComposerDraft);
  const clearComposerDraft = useDraftsStore(
    (state) => state.clearComposerDraft
  );

  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea up to ~6 lines (148px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 148)}px`;
  }, [draftText]);

  const trimmed = draftText.trim();

  const handleSend = () => {
    if (!trimmed) {
      onOpenFullCreate();
      return;
    }
    onQuickSubmit(trimmed);
    clearComposerDraft(sectionKey);
  };

  return (
    <div className="mx-auto w-full max-w-[820px] px-2.5 pb-2.5 pt-1 sm:px-4 sm:pb-3">
      {/* Reply / Edit bar above composer */}
      {replyTarget && (
        <div className="mb-1 flex items-center justify-between gap-2 rounded-t-[16px] border border-b-0 border-tg-border bg-tg-surface/95 px-3.5 py-2 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2.5">
            <ReplyArrowIcon className="h-4 w-4 shrink-0 text-tg-accent" />
            <div
              className="min-w-0 border-l-2 pl-2.5 text-[13px]"
              style={{ borderColor: "var(--tg-accent)" }}
            >
              <div className="truncate font-bold text-tg-accent">
                Riferimento a #{replyTarget.id} · {replyTarget.title}
              </div>
              <div className="truncate text-tg-muted">
                {replyTarget.subtitle}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Chiudi riferimento"
            className="rounded-full p-1 text-tg-muted hover:bg-tg-hover hover:text-tg-primary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick preset popover (Telegram sticker/emoji panel style) */}
      {showPicker && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-[16px] border border-tg-border bg-tg-surface/95 p-2.5 shadow-lg backdrop-blur-md">
          <span className="mr-1 text-[12px] font-bold text-tg-muted">
            Tag rapidi:
          </span>
          {presets.map((preset) => {
            const unlockMeta = UNLOCK_TYPE_META[preset as UnlockType];
            const isHex = /^#[0-9A-Fa-f]{6}$/.test(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  if (onQuickPresetSelect) {
                    onQuickPresetSelect(preset);
                  } else {
                    setComposerDraft(
                      sectionKey,
                      draftText ? `${draftText} ${preset}` : preset
                    );
                  }
                  setShowPicker(false);
                }}
                style={
                  unlockMeta
                    ? {
                        backgroundColor: unlockMeta.softBgVar,
                        color: unlockMeta.accentVar,
                      }
                    : undefined
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-tg-secondary px-2.5 py-1 font-mono text-[12px] font-bold text-tg-primary transition-transform hover:scale-105 cursor-pointer"
              >
                {isHex && (
                  <span
                    className="h-3 w-3 rounded-full border border-white/30"
                    style={{ backgroundColor: preset }}
                  />
                )}
                {unlockMeta ? unlockMeta.shortLabel : preset}
              </button>
            );
          })}
        </div>
      )}

      {/* Main composer bar */}
      <div className="flex items-end gap-2">
        <div
          className={`flex min-h-[44px] flex-1 items-end gap-1.5 border border-tg-border bg-tg-surface px-3 py-1.5 transition-colors focus-within:border-tg-accent ${
            replyTarget ? "rounded-b-xl" : "rounded-xl"
          }`}
        >
          {/* Left button: Emoji / Preset selector */}
          <button
            type="button"
            onClick={() => setShowPicker((prev) => !prev)}
            title="Inserisci tag o colore rapido"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-tg-muted transition-colors hover:bg-tg-hover hover:text-tg-primary cursor-pointer"
          >
            <Smile className="h-5 w-5" />
          </button>

          {/* Auto-resize textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={draftText}
            onChange={(e) => setComposerDraft(sectionKey, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              } else if (e.key === "Escape") {
                onCancelReply();
                setShowPicker(false);
              }
            }}
            placeholder={placeholder}
            className="max-h-[148px] min-h-[24px] flex-1 resize-none bg-transparent py-1 text-[14px] leading-relaxed text-tg-primary placeholder:text-tg-muted focus:outline-none"
          />

          {/* Paperclip attachment button -> opens full creation panel */}
          <button
            type="button"
            onClick={() => onOpenFullCreate(trimmed || undefined)}
            title="Apri modulo completo di creazione"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-tg-muted transition-colors hover:bg-tg-hover hover:text-tg-accent cursor-pointer"
          >
            <PaperclipIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Right button: Plus when empty, Send arrow when text present */}
        <button
          type="button"
          onClick={handleSend}
          title={
            trimmed
              ? "Invia / Crea con questo nome (Invio)"
              : "Nuovo elemento catalogo"
          }
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-tg-accent text-white transition-colors hover:bg-tg-accent-hover cursor-pointer"
        >
          {trimmed ? (
            <SendHorizontal className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
