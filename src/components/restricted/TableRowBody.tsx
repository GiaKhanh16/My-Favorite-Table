// DataRows.tsx
import { PlusIcon } from "@heroicons/react/24/solid";
import { useEffect, useCallback, useMemo, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { copySelected, getDestinationIndex } from "./Stores/helperFunctions";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { TableRows } from "./TableRows";
import { tableStore } from "./Stores/TableStore";
import ViewToggle from "../sub/Toggle";
import TableHeader from "./TableHeader";
// get reactive state

export type Column = { id: string; name: string; width: number };
export type Row = Record<string, string>;
type Pos = { r: number; c: number } | null;

export function TableRowBody() {
  const columns = tableStore((s) => s.columns);
  const rows = tableStore((s) => s.rows);
  const [highlightedColumns, setHighlightedColumns] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<Pos>(null);
  const [current, setCurrent] = useState<Pos>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [flashingColumns, setFlashingColumns] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<Pos>(null);

  const pasteData = (
    startRow: number,
    startCol: number,
    clipboardText: string
  ) => {
    const delimiter = clipboardText.includes("\t") ? "\t" : ",";
    const pastedRows = clipboardText
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => r.split(delimiter));

    const pastedRowCount = pastedRows.length;
    const pastedColCount = pastedRows[0]?.length || 0;

    tableStore.setState((state) => {
      let nextColumns = [...state.columns];
      let nextRows = [...state.rows];

      while (nextColumns.length < startCol + pastedColCount) {
        const newColId = `col${nextColumns.length + 1}`;
        nextColumns.push({ id: newColId, name: "New Col", width: 150 });
      }

      // expand rows
      while (nextRows.length < startRow + pastedRowCount) {
        const newRow: Row = {};
        nextColumns.forEach((col) => (newRow[col.id] = ""));
        nextRows.push(newRow);
      }

      // ensure new columns exist in all rows
      nextRows = nextRows.map((row) => {
        const r = { ...row };
        nextColumns.forEach((col) => {
          if (!(col.id in r)) r[col.id] = "";
        });
        return r;
      });

      // paste data
      pastedRows.forEach((row, rIndex) => {
        const targetRow = startRow + rIndex;
        row.forEach((value, cIndex) => {
          const col = nextColumns[startCol + cIndex];
          if (col) nextRows[targetRow][col.id] = value;
        });
      });

      return { columns: nextColumns, rows: nextRows };
    });
  };

  const isCellSelected = (r: number, c: number) => {
    if (!anchor || !current) return false;

    const minRow = Math.min(anchor.r, current.r);
    const maxRow = Math.max(anchor.r, current.r);
    const minCol = Math.min(anchor.c, current.c);
    const maxCol = Math.max(anchor.c, current.c);

    return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
  };

  const addRow = () => {
    tableStore.setState((state) => ({
      rows: [
        ...state.rows,
        Object.fromEntries(state.columns.map((col) => [col.id, ""])),
      ],
    }));
  };

  const updateCell = (rowIndex: number, colId: string, value: string) => {
    tableStore.setState((state) => {
      const newRows = [...state.rows];
      newRows[rowIndex] = { ...newRows[rowIndex], [colId]: value };
      return { rows: newRows };
    });
  };
  const deleteRow = useCallback((rowIndex: number) => {
    tableStore.setState((state) => ({
      rows: state.rows.filter((_, i) => i !== rowIndex),
    }));
  }, []);

  const reorderRow = useCallback((startIndex: number, finishIndex: number) => {
    tableStore.setState((state) => ({
      rows: reorder({ list: state.rows, startIndex, finishIndex }),
    }));
  }, []);

  const handleReorder = useCallback(
    ({
      startIndex,
      finishIndex,
    }: {
      startIndex: number;
      finishIndex: number;
    }) => {
      reorderRow(startIndex, finishIndex);
    },
    [reorderRow]
  );

  const selectedColumnIds = useMemo(() => {
    if (!anchor || !current) return [];
    const minCol = Math.min(anchor.c, current.c);
    const maxCol = Math.max(anchor.c, current.c);
    return columns.slice(minCol, maxCol + 1).map((c) => c.id);
  }, [anchor, current, columns]);

  useEffect(() => {
    setFlashingColumns(selectedColumnIds);
  }, [selectedColumnIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        if (!anchor || !current) return;
        e.preventDefault();

        copySelected(rows, columns, anchor, current);

        const minCol = Math.min(anchor.c, current.c);
        const maxCol = Math.max(anchor.c, current.c);
        const columnsToHighlight = columns
          .slice(minCol, maxCol + 1)
          .map((col) => col.id);

        setHighlightedColumns(columnsToHighlight);

        setTimeout(() => {
          setHighlightedColumns([]);
        }, 150);

        return;
      }

      if (
        current &&
        !editingCell &&
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        const { r, c } = current;
        const colId = columns[c].id;

        updateCell(r, colId, e.key);
        setEditingCell({ r, c });
        return;
      }

      if (current && !editingCell && (e.key === "Enter" || e.key === "F2")) {
        e.preventDefault();
        setEditingCell({ r: current.r, c: current.c });
        return;
      }

      if (e.key === "Tab") {
        if (!current || editingCell) return;

        e.preventDefault();

        let { r, c } = current;

        if (e.shiftKey) {
          c = Math.max(0, c - 1);
        } else {
          if (c < columns.length - 1) {
            c += 1;
          } else {
            c = 0;
            r = Math.min(rows.length - 1, r + 1);
          }
        }

        setAnchor({ r, c });
        setCurrent({ r, c });
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();

        if (editingCell) {
          // Move down from current editing cell
          let { r, c } = editingCell;
          r = Math.min(rows.length - 1, r + 1);

          setAnchor({ r, c });
          setCurrent({ r, c });
          setEditingCell({ r, c }); // optionally start editing immediately
          return;
        }

        if (current && !editingCell) {
          setEditingCell({ r: current.r, c: current.c });
          return;
        }
      }

      // Arrow navigation
      if (!current || editingCell) return;
      let { r, c } = current;
      switch (e.key) {
        case "ArrowUp":
          r = Math.max(0, r - 1);
          break;
        case "ArrowDown":
          r = Math.min(rows.length - 1, r + 1);
          break;
        case "ArrowLeft":
          c = Math.max(0, c - 1);
          break;
        case "ArrowRight":
          c = Math.min(columns.length - 1, c + 1);
          break;
        default:
          return;
      }
      e.preventDefault();
      if (e.shiftKey) {
        setCurrent({ r, c });
      } else {
        setAnchor({ r, c });
        setCurrent({ r, c });
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!current) return;
      e.preventDefault();
      const clipboardHTML = e.clipboardData?.getData("text/html") || "";
      const clipboardText = e.clipboardData?.getData("text/plain") || "";

      let dataToPaste = clipboardText;

      // If the HTML is from your own table, parse it
      if (clipboardHTML?.startsWith("<table")) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(clipboardHTML, "text/html");
        const table = doc.querySelector("table");
        if (table) {
          const rows: string[][] = [];
          table.querySelectorAll("tr").forEach((tr) => {
            const rowValues: string[] = [];
            tr.querySelectorAll("th, td").forEach((cell) => {
              rowValues.push(cell.textContent || "");
            });
            rows.push(rowValues);
          });

          // Skip header if you want
          rows.shift(); // remove header
          dataToPaste = rows.map((r) => r.join("\t")).join("\n");
        }
      }

      pasteData(current.r, current.c, dataToPaste);

      setEditingCell({ r: current.r, c: current.c });
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("paste", handlePaste, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("paste", handlePaste, { capture: true });
    };
  }, [anchor, current, rows, columns, editingCell, updateCell]);

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        if (source.data.type !== "row") return;

        const draggedIndex = (source.data as { rowIndex: number }).rowIndex;

        if (location.current.dropTargets.length === 1) {
          const targetIndex = (
            location.current.dropTargets[0].data as { rowIndex: number }
          ).rowIndex;

          if (draggedIndex === targetIndex) return;

          const destinationIndex = getDestinationIndex({
            startIndex: draggedIndex,
            targetIndex,
          });

          handleReorder({
            startIndex: draggedIndex,
            finishIndex: destinationIndex,
          });
        }
      },
    });
  }, [handleReorder]);

  return (
    <div className="flex flex-col items-start min-h-screen p-6 relative m-20">
      {/* Toggle aligned to the left */}
      <div className="w-full mb-4 flex justify-start">
        <ViewToggle />
      </div>

      {/* Table container */}
      <div className="flex flex-col border border-gray-200 rounded relative mt-5">
        <div className="flex border-b border-gray-200">
          <TableHeader
            columns={columns}
            rows={rows}
            highlightedColumns={highlightedColumns}
            flashingColumns={flashingColumns}
          />
        </div>
        <div className="relative">
          {rows.map((row, rowIndex) => (
            <TableRows
              key={rowIndex}
              rowData={row}
              rowIndex={rowIndex}
              columns={columns}
              deleteRow={deleteRow}
              editingCell={editingCell}
              setEditingCell={setEditingCell}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              isCellSelected={isCellSelected}
              setAnchor={setAnchor}
              setCurrent={setCurrent}
              updateCell={updateCell}
              pasteData={pasteData}
              rows={rows}
            />
          ))}

          <button
            onClick={addRow}
            className="flex items-center gap-2 cursor-pointer border-gray-100 py-1 px-2 text-[11px] text-gray-400 hover:bg-gray-50 w-full"
          >
            <PlusIcon className="w-3 h-3 text-gray-500" />
            <span className="select-none">Add Row</span>
          </button>
        </div>
      </div>
    </div>
  );
}
