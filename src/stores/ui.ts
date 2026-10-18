import { create } from "zustand";
import type { UnlockType } from "@/types/api";

export type FolderTab = "all" | "active" | "free" | "paid";
export type EditorMode = "closed" | "create" | "edit";
export type TgTheme = "dark" | "light";

interface UiState {
  theme: TgTheme;
  sidebarWidth: number;
  activeFolder: FolderTab;
  sidebarSearch: string;
  catalogSearch: string;
  unlockFilter: "ALL" | UnlockType;
  onlyActive: boolean;
  rightPanelOpen: boolean;
  mobileShowChat: boolean;
  selectedIds: number[];
  inspectedId: number | null;
  editorMode: EditorMode;
  replyTargetId: number | null;
  pinnedIdsBySection: Record<string, number[]>;
  mutedSections: Record<string, boolean>;
  setTheme: (theme: TgTheme) => void;
  toggleTheme: () => void;
  setSidebarWidth: (width: number) => void;
  setActiveFolder: (folder: FolderTab) => void;
  setSidebarSearch: (query: string) => void;
  setCatalogSearch: (query: string) => void;
  setUnlockFilter: (filter: "ALL" | UnlockType) => void;
  setOnlyActive: (onlyActive: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  setMobileShowChat: (show: boolean) => void;
  toggleSelectId: (id: number) => void;
  clearSelection: () => void;
  setInspectedId: (id: number | null) => void;
  openCreatePanel: () => void;
  openEditPanel: (id: number) => void;
  openInspectPanel: (id: number) => void;
  closeRightPanel: () => void;
  setReplyTargetId: (id: number | null) => void;
  togglePinItem: (section: string, id: number) => void;
  toggleMuteSection: (section: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: "dark",
  sidebarWidth: 360,
  activeFolder: "all",
  sidebarSearch: "",
  catalogSearch: "",
  unlockFilter: "ALL",
  onlyActive: false,
  rightPanelOpen: false,
  mobileShowChat: true,
  selectedIds: [],
  inspectedId: null,
  editorMode: "closed",
  replyTargetId: null,
  pinnedIdsBySection: {},
  mutedSections: {},
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
  setSidebarWidth: (width) =>
    set({ sidebarWidth: Math.min(420, Math.max(320, width)) }),
  setActiveFolder: (activeFolder) => set({ activeFolder }),
  setSidebarSearch: (sidebarSearch) => set({ sidebarSearch }),
  setCatalogSearch: (catalogSearch) => set({ catalogSearch }),
  setUnlockFilter: (unlockFilter) => set({ unlockFilter }),
  setOnlyActive: (onlyActive) => set({ onlyActive }),
  setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
  toggleRightPanel: () =>
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setMobileShowChat: (mobileShowChat) => set({ mobileShowChat }),
  toggleSelectId: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),
  setInspectedId: (inspectedId) => set({ inspectedId }),
  openCreatePanel: () =>
    set({
      rightPanelOpen: true,
      editorMode: "create",
      inspectedId: null,
    }),
  openEditPanel: (id) =>
    set({
      rightPanelOpen: true,
      editorMode: "edit",
      inspectedId: id,
    }),
  openInspectPanel: (id) =>
    set({
      rightPanelOpen: true,
      editorMode: "closed",
      inspectedId: id,
    }),
  closeRightPanel: () =>
    set({
      rightPanelOpen: false,
      editorMode: "closed",
    }),
  setReplyTargetId: (replyTargetId) => set({ replyTargetId }),
  togglePinItem: (section, id) =>
    set((state) => {
      const current = state.pinnedIdsBySection[section] ?? [];
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current];
      return {
        pinnedIdsBySection: {
          ...state.pinnedIdsBySection,
          [section]: next,
        },
      };
    }),
  toggleMuteSection: (section) =>
    set((state) => ({
      mutedSections: {
        ...state.mutedSections,
        [section]: !state.mutedSections[section],
      },
    })),
}));
