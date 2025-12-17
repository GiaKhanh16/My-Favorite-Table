// DataRows.tsx
import { PlusIcon } from "@heroicons/react/24/solid";
import { useEffect, useCallback } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
// import { Cell } from "./subComponents/Cell";
import { useTableStore } from "./ZustandStore";
import { ZustandCell } from "./ZustandCell";

export type Column = { id: string; name: string };
export type Row = Record<string, string>;

// ------------------- UTILS (UNCHANGED) -------------------
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

export function ZustandRow() {
  // -------- Zustand (replacing useState) --------
  const {
    columns,
    rows,
    anchor,
    current,
    editingCell,
    // isDragging,

    updateCell,
    // deleteRow,
    reorderRow,

    setAnchor,
    setCurrent,
    setEditingCell,
    // setIsDragging,

    // isCellSelected,
  } = useTableStore();

  // ------------------- REORDER (UNCHANGED LOGIC) -------------------
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

  // ------------------- KEYBOARD EVENTS (UNCHANGED) -------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        if (!anchor || !current) return;
        e.preventDefault();
        copySelected(rows, columns, anchor, current);
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

        updateCell(r, colId, e.key); // ✅ just call the action
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

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [anchor, current, rows, columns, editingCell]);
  // ------------------- DRAG & DROP (UNCHANGED) -------------------
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

  // ------------------- RENDER (UNCHANGED) -------------------
  return (
    <div className="relative">
      {rows.map((row, rowIndex) => (
        <ZustandCell
          key={rowIndex}
          rowData={row}
          rowIndex={rowIndex}
          headers={columns}
        />
      ))}

      <button
        onClick={() =>
          useTableStore.setState((state) => {
            state.rows.push(Object.fromEntries(columns.map((h) => [h.id, ""])));
          })
        }
        className="flex items-center gap-2 cursor-pointer border-gray-100 py-1 px-2 text-[11px] text-gray-400 hover:bg-gray-50 w-full"
      >
        <PlusIcon className="w-3 h-3 text-gray-500" />
        <span className="select-none">Add Row</span>
      </button>
    </div>
  );
}

export default function ZustandContainer() {
  return (
    <div className="flex justify-center items-start min-h-screen p-6 relative mt-15">
      <div className="flex flex-col  max-w-4xl border border-gray-200 rounded relative">
        <ZustandRow />
      </div>
    </div>
  );
}
