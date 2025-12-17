import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

export type Column = { id: string; name: string; width: number };

export type Row = Record<string, string>;

type Pos = { r: number; c: number } | null;

type TableState = {
  // -------- state --------
  columns: Column[];
  rows: Row[];

  anchor: Pos;
  current: Pos;
  editingCell: Pos;
  isDragging: boolean;

  // -------- actions --------
  updateCell: (rowIndex: number, colId: string, value: string) => void;
  deleteRow: (rowIndex: number) => void;
  reorderRow: (startIndex: number, finishIndex: number) => void;

  setAnchor: (pos: Pos) => void;
  setCurrent: (pos: Pos) => void;
  setEditingCell: (pos: Pos) => void;
  setIsDragging: (val: boolean) => void;

  setColumnWidth: (colId: string, width: number) => void;
  // -------- selectors --------
  isCellSelected: (r: number, c: number) => boolean;
  ensureSize: (rows: number, cols: number) => void;
};

export const useTableStore = create<TableState>()(
  immer((set, get) => ({
    // -------- initial state --------
    columns: [
      { id: "col1", name: "Name", width: 150 },
      { id: "col2", name: "Birthday", width: 150 },
      { id: "col3", name: "Location", width: 150 },
      { id: "col4", name: "Contact", width: 150 },
      { id: "col5", name: "Social", width: 150 },
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

    anchor: null,
    current: null,
    editingCell: null,
    isDragging: false,

    // -------- actions --------
    updateCell: (rowIndex, colId, value) =>
      set((state) => {
        state.rows[rowIndex][colId] = value;
      }),

    deleteRow: (rowIndex) =>
      set((state) => {
        state.rows.splice(rowIndex, 1);
      }),

    ensureSize: (rows: number, cols: number) =>
      set((state) => {
        const currentRows = state.rows.length;
        const currentCols = state.columns.length;

        // Add new rows if needed
        for (let r = currentRows; r < rows; r++) {
          const newRow: Row = {};
          state.columns.forEach((col) => (newRow[col.id] = ""));
          state.rows.push(newRow);
        }

        // Add new columns if needed
        for (let c = currentCols; c < cols; c++) {
          const id = `col${c + 1}`;
          state.columns.push({ id, name: id, width: 150 });
          state.rows.forEach((row) => (row[id] = ""));
        }
      }),

    reorderRow: (startIndex, finishIndex) =>
      set((state) => {
        state.rows = reorder({
          list: state.rows,
          startIndex,
          finishIndex,
        });
      }),

    setAnchor: (pos) =>
      set((state) => {
        state.anchor = pos;
      }),

    setCurrent: (pos) =>
      set((state) => {
        state.current = pos;
      }),

    setEditingCell: (pos) =>
      set((state) => {
        state.editingCell = pos;
      }),

    setIsDragging: (val) =>
      set((state) => {
        state.isDragging = val;
      }),

    setColumnWidth: (colId: string, width: number) =>
      set((state) => {
        const col = state.columns.find((c) => c.id === colId);
        if (col) col.width = width; // only updates the dragged column
      }),
    // -------- selector --------
    isCellSelected: (r, c) => {
      const { anchor, current } = get();
      if (!anchor || !current) return false;

      const minRow = Math.min(anchor.r, current.r);
      const maxRow = Math.max(anchor.r, current.r);
      const minCol = Math.min(anchor.c, current.c);
      const maxCol = Math.max(anchor.c, current.c);

      return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
    },
  }))
);
