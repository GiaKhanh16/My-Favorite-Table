import {
  UserIcon,
  CakeIcon,
  MapIcon,
  PhoneIcon,
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

function HeaderRow({
  headers,
  setHeaders,
}: {
  headers: { label: string }[];
  setHeaders: (headers: { label: string }[]) => void;
}) {
  return (
    <div className="flex border-b border-gray-200">
      {headers.map((header, index) => (
        <label
          key={index}
          className={`flex items-center gap-2 flex-1 text-left text-[11px] py-2 px-2 text-gray-400 hover:bg-gray-50 ${
            index < headers.length - 1 ? "border-r border-gray-100" : ""
          }`}
          style={{ fontWeight: 500 }}
        >
          <input
            type="text"
            value={header.label}
            onChange={(e) => {
              const newHeaders = [...headers];
              newHeaders[index].label = e.target.value;
              setHeaders(newHeaders);
            }}
            className="bg-transparent outline-none w-full selection:bg-gray-300 selection:text-white text-[11px]"
          />
        </label>
      ))}
    </div>
  );
}

function DataRow({
  row,
  rowIndex,
  headersLength,
  editingCell,
  setEditingCell,
  anchor,
  current,
  isDragging,
  setAnchor,
  setCurrent,
  setIsDragging,
  updateCell,
  deleteRow,
  isCellSelected,
}: {
  row: string[];
  rowIndex: number;
  headersLength: number;
  editingCell: { r: number; c: number } | null;
  setEditingCell: (cell: { r: number; c: number } | null) => void;
  anchor: { r: number; c: number } | null;
  current: { r: number; c: number } | null;
  isDragging: boolean;
  setAnchor: (pos: { r: number; c: number }) => void;
  setCurrent: (pos: { r: number; c: number }) => void;
  setIsDragging: (dragging: boolean) => void;
  updateCell: (rowIndex: number, colIndex: number, value: string) => void;
  deleteRow: (rowIndex: number) => void;
  isCellSelected: (r: number, c: number) => boolean;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = rowRef.current;
    invariant(el);

    return draggable({
      element: el,
      getInitialData: () => ({
        type: "row",
        rowIndex,
      }),
    });
  }, [rowIndex]);

  return (
    <div className="flex border-b border-gray-100 items-center relative group">
      <div
        className="absolute -left-11 top-1/2 transform -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={() => deleteRow(rowIndex)}
      >
        <TrashIcon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="absolute -left-6   top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 flex-col flex">
        <Squares2X2Icon className="h-3.5 w-3.5 text-gray-400" />
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
            className="flex-1 py-2 px-2 text-[11px] border-r border-gray-100 last:border-none relative"
          >
            {selected && (
              <div className="absolute inset-0 bg-blue-100 opacity-40 pointer-events-none"></div>
            )}
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={cell}
                onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                onBlur={() => setEditingCell(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingCell(null);
                }}
                className="bg-transparent outline-none w-full h-full text-gray-500 text-[11px]"
              />
            ) : (
              <div
                className="flex-1 text-[11px] text-gray-500 min-h-[16px] select-none"
                onMouseDown={() => {
                  setAnchor({ r: rowIndex, c: colIndex });
                  setCurrent({ r: rowIndex, c: colIndex });
                  setIsDragging(true);
                }}
                onMouseEnter={() => {
                  if (isDragging) setCurrent({ r: rowIndex, c: colIndex });
                }}
                onMouseUp={() => setIsDragging(false)}
                onDoubleClick={() => {
                  setEditingCell({ r: rowIndex, c: colIndex });
                }}
              >
                {cell}
              </div>
            )}
          </div>
        );
      })}
      {row.length < headersLength &&
        Array(headersLength - row.length)
          .fill(null)
          .map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex-1 py-2 px-2 text-[11px] border-r border-gray-100 last:border-none relative"
            />
          ))}
    </div>
  );
}

function TestTubeTube() {
  const initialHeaders = [
    { label: "Name" },
    { label: "Birthday" },
    { label: "Location" },
    { label: "Contact" },
    { label: "Social" },
  ];

  const [editingCell, setEditingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [anchor, setAnchor] = useState<{ r: number; c: number } | null>(null);
  const [current, setCurrent] = useState<{ r: number; c: number } | null>(null);
  const [headers, setHeaders] = useState(initialHeaders);
  const [isDragging, setIsDragging] = useState(false);
  const [rows, setRows] = useState<string[][]>([
    ["Alice", "01/01/1990", "New York", "123-456-7890", "@alice"],
    ["Bob", "02/02/1985", "Los Angeles", "987-654-3210", "@bob"],
    ["Charlie", "03/03/1992", "Chicago", "555-555-5555", "@charlie"],
  ]);

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill("")]);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const deleteRow = (rowIndex: number) => {
    setRows(rows.filter((_, i) => i !== rowIndex));
  };

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        if (!anchor || !current) return;
        e.preventDefault();
        copySelected();
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
        updateCell(r, c, e.key);
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
  }, [anchor, current, rows, headers.length, editingCell]);

  return (
    <div className="flex justify-center items-start min-h-screen p-6 relative mt-15">
      <div className="flex flex-col w-full max-w-4xl border border-gray-200 rounded relative">
        <HeaderRow headers={headers} setHeaders={setHeaders} />

        <div className="relative">
          {rows.map((row, rowIndex) => (
            <DataRow
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              headersLength={headers.length}
              editingCell={editingCell}
              setEditingCell={setEditingCell}
              anchor={anchor}
              current={current}
              isDragging={isDragging}
              setAnchor={setAnchor}
              setCurrent={setCurrent}
              setIsDragging={setIsDragging}
              updateCell={updateCell}
              deleteRow={deleteRow}
              isCellSelected={isCellSelected}
            />
          ))}
        </div>

        <div
          onClick={addRow}
          className="flex items-center gap-2 cursor-pointer border-gray-100 py-1 px-2 text-[11px] text-gray-400 hover:bg-gray-50"
        >
          <PlusIcon className="w-3 h-3 text-gray-500" />
          <span className="select-none">Add Row</span>
        </div>
      </div>
    </div>
  );
}

export default TestTubeTube;
