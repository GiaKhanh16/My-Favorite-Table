// DataRows.tsx
import { PlusIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useCallback } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { Cell } from "./Cell";

export type Column = { id: string; name: string };
export type Row = Record<string, string>;

// ------------------- UTILS -------------------
export const updateCell = (
  rows: Row[],
  rowIndex: number,
  colId: string,
  value: string
): Row[] => {
  const newRows = [...rows];
  newRows[rowIndex] = { ...newRows[rowIndex], [colId]: value };
  return newRows;
};

export const isCellSelected = (
  anchor: { r: number; c: number } | null,
  current: { r: number; c: number } | null,
  r: number,
  c: number
) => {
  if (!anchor || !current) return false;
  const minRow = Math.min(anchor.r, current.r);
  const maxRow = Math.max(anchor.r, current.r);
  const minCol = Math.min(anchor.c, current.c);
  const maxCol = Math.max(anchor.c, current.c);
  return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
};
export const copySelected = async (
  rows: Row[],
  columns: Column[],
  anchor: { r: number; c: number } | null,
  current: { r: number; c: number } | null
) => {
  if (!anchor || !current) return;

  const minRow = Math.min(anchor.r, current.r);
  const maxRow = Math.max(anchor.r, current.r);
  const minCol = Math.min(anchor.c, current.c);
  const maxCol = Math.max(anchor.c, current.c);

  let html = `<table style="border-collapse: collapse;">`;
  const textRows: string[] = [];

  for (let r = minRow; r <= maxRow; r++) {
    html += `<tr>`;
    const rowValues: string[] = [];

    for (let c = minCol; c <= maxCol; c++) {
      const colId = columns[c].id;
      const val = rows[r][colId] ?? "";
      html += `<td style="border:1px solid #000; padding:2px 6px;">${val}</td>`;
      rowValues.push(val);
    }

    html += `</tr>`;
    textRows.push(rowValues.join("\t"));
  }

  html += `</table>`;
  const text = textRows.join("\n");

  try {
    // Copy both HTML and plain text to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
  } catch {
    // Fallback: copy plain text only
    await navigator.clipboard.writeText(text);
  }
};

export const reorderRow = ({
  rows,
  startIndex,
  finishIndex,
}: {
  rows: Row[];
  startIndex: number;
  finishIndex: number;
}) => reorder({ list: rows, startIndex, finishIndex });

export const deleteRow = (rows: Row[], rowIndex: number) =>
  rows.filter((_, i) => i !== rowIndex);

export const getDestinationIndex = ({
  startIndex,
  targetIndex,
}: {
  startIndex: number;
  targetIndex: number;
}) =>
  getReorderDestinationIndex({
    startIndex,
    indexOfTarget: targetIndex,
    closestEdgeOfTarget: null,
    axis: "vertical",
  }) as number;

// ------------------- COMPONENT -------------------
export default function DataRows() {
  const [headers, _] = useState<Column[]>([
    { id: "col1", name: "Name" },
    { id: "col2", name: "Birthday" },
    { id: "col3", name: "Location" },
    { id: "col4", name: "Contact" },
    { id: "col5", name: "Social" },
  ]);

  const [rows, setRows] = useState<Row[]>([
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
  ]);

  const [anchor, setAnchor] = useState<{ r: number; c: number } | null>(null);
  const [current, setCurrent] = useState<{ r: number; c: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ------------------- REORDER -------------------
  const handleReorder = useCallback(
    ({
      startIndex,
      finishIndex,
    }: {
      startIndex: number;
      finishIndex: number;
    }) => {
      setRows((prevRows) =>
        reorderRow({ rows: prevRows, startIndex, finishIndex })
      );
    },
    []
  );

  // ------------------- KEYBOARD EVENTS -------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        if (!anchor || !current) return;
        e.preventDefault();
        copySelected(rows, headers, anchor, current);
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
        const colId = headers[c].id;
        setRows((prev) => updateCell(prev, r, colId, e.key));
        setEditingCell({ r, c });
        return;
      }

      if (current && !editingCell && (e.key === "Enter" || e.key === "F2")) {
        e.preventDefault();
        setEditingCell({ r: current.r, c: current.c });
        return;
      }

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
          c = Math.min(headers.length - 1, c + 1);
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

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [anchor, current, rows, headers, editingCell]);

  // ------------------- DRAG & DROP -------------------
  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        if (source.data.type !== "row") return;

        const draggedIndex = (source.data as { type: "row"; rowIndex: number })
          .rowIndex;

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

  // ------------------- RENDER -------------------
  return (
    <div className="relative">
      {rows.map((row, rowIndex) => (
        <Cell
          key={rowIndex}
          rowData={row}
          rowIndex={rowIndex}
          headers={headers}
          updateCell={(r, colId, val) =>
            setRows((prev) => updateCell(prev, r, colId, val))
          }
          isCellSelected={(r, c) => isCellSelected(anchor, current, r, c)}
          editingCell={editingCell}
          setEditingCell={setEditingCell}
          setAnchor={setAnchor}
          setCurrent={setCurrent}
          deleteRow={() => setRows((prevRows) => deleteRow(prevRows, rowIndex))}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />
      ))}

      <button
        onClick={() =>
          setRows([...rows, Object.fromEntries(headers.map((h) => [h.id, ""]))])
        }
        className="flex items-center gap-2 cursor-pointer border-gray-100 py-1 px-2 text-[11px] text-gray-400 hover:bg-gray-50 w-full"
      >
        <PlusIcon className="w-3 h-3 text-gray-500" />
        <span className="select-none">Add Row</span>
      </button>
    </div>
  );
}
