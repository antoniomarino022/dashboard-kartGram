"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  itemName,
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-tg-border bg-tg-surface/95 p-6 text-tg-primary shadow-2xl backdrop-blur-xl focus:outline-none">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-tg-danger-soft text-tg-danger">
            <Trash2 className="h-5 w-5" />
          </div>
          <Dialog.Title className="text-[17px] font-extrabold text-tg-primary">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1.5 text-[14px] leading-snug text-tg-muted">
            Confermi l&apos;eliminazione definitiva di{" "}
            <strong className="font-bold text-tg-primary">
              &ldquo;{itemName}&rdquo;
            </strong>
            ? L&apos;operazione non può essere annullata.
          </Dialog.Description>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-full px-4 py-2 text-[13px] font-bold text-tg-accent hover:bg-tg-hover focus-visible:outline-2 focus-visible:outline-tg-accent disabled:opacity-50 cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-full bg-tg-danger px-4 py-2 text-[13px] font-bold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-tg-danger disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? "Eliminazione..." : "Elimina"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
