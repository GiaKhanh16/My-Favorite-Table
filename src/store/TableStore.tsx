// store/TableStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type Column = { id: string; name: string };
export type Row = Record<string, string>;

export type TableStore = {
  cols: Column[];
  rows: Row[];
  addRow: () => void;
  deleteRow: (index: number) => void;
  updateCell: (rowIndex: number, colId: string, value: string) => void;
};

export const useTableStore = create(
  immer<TableStore>((set, get) => ({
    cols: [
      { id: "col1", name: "Name" },
      { id: "col2", name: "Birthday" },
      { id: "col3", name: "Location" },
      { id: "col4", name: "Contact" },
      { id: "col5", name: "Social" },
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

    updateCell: (rowIndex, colId, value) => {
      set((state) => {
        state.rows[rowIndex][colId] = value;
      });
    },

    addRow: () => {
      const emptyRow: Row = {};
      get().cols.forEach((col) => (emptyRow[col.id] = ""));
      set((state) => {
        state.rows.push(emptyRow);
      });
    },

    deleteRow: (rowIndex) => {
      set((state) => {
        state.rows.splice(rowIndex, 1);
      });
    },
  }))
);
