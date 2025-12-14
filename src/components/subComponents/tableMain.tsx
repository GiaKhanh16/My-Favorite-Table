import React, { useState, useEffect } from "react";
import type {
  Header,
  TableHeaderProps,
  TableHeaderType,
  TableMainProps,
} from "../Utils/types";
import { TrashIcon } from "@heroicons/react/24/solid";

type TableMainSectionProps = {
  headers: TableHeaderType[];
};

function TableMainSection({ headers }: TableMainSectionProps) {
  const [rows, setRows] = useState<string[][]>([
    ["Alice", "01/01/1990", "New York", "123-456-7890", "@alice"],
    ["Bob", "02/02/1985", "Los Angeles", "987-654-3210", "@bob"],
    ["Charlie", "03/03/1992", "Chicago", "555-555-5555", "@charlie"],
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [anchor, setAnchor] = useState<{ r: number; c: number } | null>(null);
  const [current, setCurrent] = useState<{ r: number; c: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);

  const deleteRow = (rowIndex: number) => {
    const newRows = rows.filter((_, i) => i !== rowIndex);
    setRows(newRows);
  };

  const isCellSelected = (r: number, c: number) => {
    if (!anchor || !current) return false;

    const minRow = Math.min(anchor.r, current.r);
    const maxRow = Math.max(anchor.r, current.r);
    const minCol = Math.min(anchor.c, current.c);
    const maxCol = Math.max(anchor.c, current.c);

    return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const copySelected = async () => {
    if (!anchor || !current) return;

    const minRow = Math.min(anchor.r, current.r);
    const maxRow = Math.max(anchor.r, current.r);
    const minCol = Math.min(anchor.c, current.c);
    const maxCol = Math.max(anchor.c, current.c);

    // ---------- HTML ----------
    let html = `<table style="border-collapse: collapse;">`;

    for (let r = minRow; r <= maxRow; r++) {
      html += `<tr>`;
      for (let c = minCol; c <= maxCol; c++) {
        const value = rows[r][c] ?? "";
        html += `
        <td style="border: 1px solid #000; padding: 2px 6px;">
          ${value}
        </td>
      `;
      }
      html += `</tr>`;
    }

    html += `</table>`;

    // ---------- Plain text fallback ----------
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
      // Safari / permission fallback
      await navigator.clipboard.writeText(text);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ---------- COPY ----------
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        if (!anchor || !current) return;

        e.preventDefault();
        copySelected();
        return;
      }

      // ---------- NAVIGATION ----------
      if (!current) return;

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
  }, [anchor, current, rows, headers.length]);

  return (
    <div>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex border-b border-gray-100 items-center relative group"
        >
          <div
            className="absolute -left-6 top-1/2 transform -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={() => deleteRow(rowIndex)}
          >
            <TrashIcon className="w-3.5 h-3.5 text-gray-400" />
          </div>

          {row.map((cell, colIndex) => {
            const selected = isCellSelected(rowIndex, colIndex);
            const isEditing =
              editingCell?.r === rowIndex && editingCell?.c === colIndex;
            return (
              <div
                key={colIndex}
                onMouseDown={() => {
                  setAnchor({ r: rowIndex, c: colIndex });
                  setCurrent({ r: rowIndex, c: colIndex });
                  setIsDragging(true);
                }}
                onMouseEnter={() => {
                  if (isDragging) setCurrent({ r: rowIndex, c: colIndex });
                }}
                onMouseUp={() => setIsDragging(false)}
                onDoubleClick={() =>
                  setEditingCell({ r: rowIndex, c: colIndex })
                }
                className="flex-1 py-2 px-2 text-[11px] border-r border-gray-100 last:border-none relative"
              >
                {selected && (
                  <div className="absolute inset-0 bg-blue-100 opacity-40 pointer-events-none"></div>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) =>
                      updateCell(rowIndex, colIndex, e.target.value)
                    }
                    className="bg-transparent outline-none w-full h-full text-gray-500 text-[11px]bg-green-200"
                  />
                ) : (
                  <div className="flex-1 text-[11px] text-gray-500 min-h-[16px] select-none">
                    {cell}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default TableMainSection;
