"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  danger = false,
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-tg-border bg-tg-surface/95 p-6 text-tg-primary shadow-elevated backdrop-blur-xl focus:outline-none">
          <Dialog.Title className="text-lg font-extrabold">{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-1.5 text-sm leading-snug text-tg-muted">
              {description}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="rounded-full px-4 py-2 text-sm font-bold text-tg-accent-ink hover:bg-tg-hover disabled:opacity-50 cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-50 cursor-pointer",
                danger
                  ? "bg-tg-danger text-tg-on-danger"
                  : "bg-tg-accent text-tg-on-accent"
              )}
            >
              {isPending ? "Attendi…" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
