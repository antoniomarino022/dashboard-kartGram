"use client";

import {
  Banner,
  Button,
  IconButton,
  Section,
  Text,
  Title,
} from "@telegram-apps/telegram-ui";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  itemName,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <Title level="3" className="!text-zinc-100">
            {title}
          </Title>
          <IconButton
            size="s"
            mode="gray"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Chiudi"
          >
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <Section className="overflow-hidden rounded-xl border border-red-500/25 bg-red-500/5">
          <Banner
            type="inline"
            before={
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/15 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
            }
            header="Conferma eliminazione permanente"
            subheader={`Elemento selezionato: "${itemName}"`}
            description="Questa operazione rimuoverà definitivamente il record dal database di Kart-Gram e non può essere annullata."
          />
        </Section>

        <div className="mt-4 px-1">
          <Text className="!text-xs !text-zinc-400">
            La cache del catalogo verrà aggiornata automaticamente al termine
            dell&apos;operazione.
          </Text>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
          <Button
            type="button"
            size="m"
            mode="gray"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button
            type="button"
            size="m"
            mode="filled"
            loading={isLoading}
            disabled={isLoading}
            onClick={onConfirm}
            before={<Trash2 className="h-4 w-4" />}
            className="!bg-red-600 !text-white hover:!bg-red-500"
          >
            Elimina definitivamente
          </Button>
        </div>
      </div>
    </div>
  );
}
