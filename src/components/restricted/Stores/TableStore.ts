import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type Column = { id: string; name: string; width: number };

export type Row = Record<string, string>;

type TableStore = {
  columns: Column[];
  rows: Row[];
};

export const tableStore = create<TableStore>()(
  immer((_set, _get) => ({
    columns: [
      { id: "col1", name: "A", width: 150 },
      { id: "col2", name: "B", width: 150 },
      { id: "col3", name: "C", width: 150 },
      { id: "col4", name: "D", width: 150 },
      { id: "col5", name: "E", width: 150 },
    ],

    rows: [
      {
        col1: "Alice",
        col2: "01/01/1990",
        col3: "New York",
        col4: "123-456-7890",
        col5: "@alice",
      },
      {
        col1: "Bob",
        col2: "02/02/1985",
        col3: "Los Angeles",
        col4: "987-654-3210",
        col5: "@bob",
      },
      {
        col1: "Charlie",
        col2: "03/03/1992",
        col3: "Chicago",
        col4: "555-555-5555",
        col5: "@charlie",
      },
    ],
  }))
);

type View = "table" | "grid";

interface ViewState {
  view: View;
  setView: (view: View) => void;
  toggleView: () => void;
}

export const GlobalViewControl = create<ViewState>((set) => ({
  view: "table",
  setView: (view) => set({ view }),
  toggleView: () =>
    set((state) => ({ view: state.view === "table" ? "grid" : "table" })),
}));
