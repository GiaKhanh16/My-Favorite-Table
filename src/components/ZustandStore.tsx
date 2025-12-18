import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

export type Column = { id: string; name: string; width: number };

export type Row = Record<string, string>;

type Pos = { r: number; c: number } | null;
type TableState = {
  columns: Column[];
  rows: Row[];

  anchor: Pos;
  current: Pos;
  editingCell: Pos;
  isDragging: boolean;

  updateCell: (rowIndex: number, colId: string, value: string) => void;
  deleteRow: (rowIndex: number) => void;

  reorderRow: (startIndex: number, finishIndex: number) => void;
  reorderColumn: (startIndex: number, finishIndex: number) => void;

  setAnchor: (pos: Pos) => void;
  setCurrent: (pos: Pos) => void;
  setEditingCell: (pos: Pos) => void;
  setIsDragging: (val: boolean) => void;

  setColumnWidth: (colId: string, width: number) => void;
  setColumnName: (colId: string, name: string) => void;
  addColumn: () => void;

  isCellSelected: (r: number, c: number) => boolean;
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

    setColumnName: (colId, name) =>
      set((state) => {
        const col = state.columns.find((c) => c.id === colId);
        if (col) col.name = name;
      }),

    updateCell: (rowIndex, colId, value) =>
      set((state) => {
        state.rows[rowIndex][colId] = value;
      }),

    deleteRow: (rowIndex) =>
      set((state) => {
        state.rows.splice(rowIndex, 1);
      }),
    reorderColumn: (startIndex: number, finishIndex: number) =>
      set((state) => {
        state.columns = reorder({
          list: state.columns,
          startIndex,
          finishIndex,
        });

        state.rows = state.rows.map((row) => {
          const newRow: Row = {};
          state.columns.forEach((col) => {
            newRow[col.id] = row[col.id];
          });
          return newRow;
        });
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
    isCellSelected: (r, c) => {
      const { anchor, current } = get();
      if (!anchor || !current) return false;

      const minRow = Math.min(anchor.r, current.r);
      const maxRow = Math.max(anchor.r, current.r);
      const minCol = Math.min(anchor.c, current.c);
      const maxCol = Math.max(anchor.c, current.c);

      return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
    },
    addColumn: () =>
      set((state) => {
        const newColId = `col${state.columns.length + 1}`;
        state.columns.push({ id: newColId, name: `New Col`, width: 150 });
        state.rows.forEach((row) => {
          row[newColId] = "";
        });
      }),
  }))
);
