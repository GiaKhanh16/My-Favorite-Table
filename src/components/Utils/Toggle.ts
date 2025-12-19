// store/viewStore.ts
import { create } from "zustand";

type View = "table" | "grid";

interface ViewState {
  view: View;
  setView: (view: View) => void;
  toggleView: () => void;
}

export const useViewStore = create<ViewState>((set) => ({
  view: "table",
  setView: (view) => set({ view }),
  toggleView: () =>
    set((state) => ({ view: state.view === "table" ? "grid" : "table" })),
}));
