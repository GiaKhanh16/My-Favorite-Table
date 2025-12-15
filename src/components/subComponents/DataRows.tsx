import { PlusIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useCallback } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { Cell } from "./Cell";

export default function DataRows({ headers }: any) {
  const [anchor, setAnchor] = useState<{ r: number; c: number } | null>(null);
  const [current, setCurrent] = useState<{ r: number; c: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const [rows, setRows] = useState<string[][]>([
    ["Alice", "01/01/1990", "New York", "123-456-7890", "@alice"],
    ["Bob", "02/02/1985", "Los Angeles", "987-654-3210", "@bob"],
    ["Charlie", "03/03/1992", "Chicago", "555-555-5555", "@charlie"],
  ]);

  const [editing, setEditing] = useState<any>(null);
  const [editingCell, setEditingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);

  const isCellSelected = (r: number, c: number) => {
    if (!anchor || !current) return false;
    const minRow = Math.min(anchor.r, current.r);
    const maxRow = Math.max(anchor.r, current.r);
    const minCol = Math.min(anchor.c, current.c);
    const maxCol = Math.max(anchor.c, current.c);
    return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
  };

  const copySelected = async () => {
    if (!anchor || !current) return;
    const minRow = Math.min(anchor.r, current.r);
    const maxRow = Math.max(anchor.r, current.r);
    const minCol = Math.min(anchor.c, current.c);
    const maxCol = Math.max(anchor.c, current.c);

    let html = `<table style="border-collapse: collapse;">`;
    for (let r = minRow; r <= maxRow; r++) {
      html += `<tr>`;
      for (let c = minCol; c <= maxCol; c++) {
        html += `<td style="border:1px solid #000; padding:2px 6px;">${
          rows[r][c] ?? ""
        }</td>`;
      }
      html += `</tr>`;
    }
    html += `</table>`;

    const textRows: string[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      const rowValues: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        rowValues.push(rows[r][c] ?? "");
      }
      textRows.push(rowValues.join("\t"));
    }
    const text = textRows.join("\n");

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
    } catch {
      await navigator.clipboard.writeText(text);
    }
  };

  const reorderRow = useCallback(
    ({
      startIndex,
      finishIndex,
    }: {
      startIndex: number;
      finishIndex: number;
    }) => {
      setRows((prevRows) =>
        reorder({ list: prevRows, startIndex, finishIndex })
      );
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ---------- COPY ----------
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        if (!anchor || !current) return;
        e.preventDefault();
        copySelected();
        return;
      }

      // ---------- START TYPING TO EDIT ----------
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
        updateCell(r, c, e.key);
        setEditingCell({ r, c });
        return;
      }

      // ---------- ENTER / F2 TO EDIT ----------
      if (current && !editingCell && (e.key === "Enter" || e.key === "F2")) {
        e.preventDefault();
        setEditingCell({ r: current.r, c: current.c });
        return;
      }

      // ---------- NAVIGATION ----------
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
  }, [anchor, current, rows, headers.length, editingCell]);

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        // Make sure the type is "row" first
        if (source.data.type !== "row") return;

        // Assert source.data has rowIndex
        const draggedData = source.data as { type: "row"; rowIndex: number };
        const draggedIndex = draggedData.rowIndex;

        if (location.current.dropTargets.length === 1) {
          const targetRecord = location.current.dropTargets[0];

          // Assert targetRecord.data has rowIndex
          const targetData = targetRecord.data as { rowIndex: number };
          const targetIndex = targetData.rowIndex;

          if (draggedIndex === targetIndex) return;

          const destinationIndex = getReorderDestinationIndex({
            startIndex: draggedIndex,
            indexOfTarget: targetIndex,
            closestEdgeOfTarget: null,
            axis: "vertical",
          }) as number;

          reorderRow({
            startIndex: draggedIndex,
            finishIndex: destinationIndex,
          });
        }
      },
    });
  }, [reorderRow]);
  const deleteRow = (rowIndex: number) => {
    setRows(rows.filter((_, i) => i !== rowIndex));
  };

  return (
    <div className="relative">
      {rows.map((row, rowIndex) => (
        <Cell
          key={rowIndex}
          rowData={row}
          rowIndex={rowIndex}
          onDelete={deleteRow}
          headers={headers}
          updateCell={updateCell}
          isCellSelected={isCellSelected}
          editingCell={editingCell}
          setEditingCell={setEditingCell}
          setAnchor={setAnchor}
          setCurrent={setCurrent}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />
      ))}
      <button
        onClick={() => setRows([...rows, Array(headers.length).fill("")])}
        className="flex items-center gap-2 cursor-pointer border-gray-100 py-1 px-2 text-[11px] text-gray-400 hover:bg-gray-50"
      >
        <PlusIcon className="w-3 h-3 text-gray-500" />
        <span className="select-none">Add Row</span>
      </button>
    </div>
  );
}
