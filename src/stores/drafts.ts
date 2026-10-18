import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DraftsState {
  composerDrafts: Record<string, string>;
  setComposerDraft: (sectionKey: string, text: string) => void;
  clearComposerDraft: (sectionKey: string) => void;
}

export const useDraftsStore = create<DraftsState>()(
  persist(
    (set) => ({
      composerDrafts: {},
      setComposerDraft: (sectionKey, text) =>
        set((state) => ({
          composerDrafts: {
            ...state.composerDrafts,
            [sectionKey]: text,
          },
        })),
      clearComposerDraft: (sectionKey) =>
        set((state) => {
          const next = { ...state.composerDrafts };
          delete next[sectionKey];
          return { composerDrafts: next };
        }),
    }),
    {
      name: "kartgram-tg-drafts",
    }
  )
);
