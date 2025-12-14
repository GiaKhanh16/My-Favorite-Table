import { PlusIcon, TrashIcon, Squares2X2Icon } from "@heroicons/react/24/solid";
import invariant from "tiny-invariant";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { useState, useEffect, useRef } from "react";
import TableHeader from "./subComponents/tableHeader";

function TestTable() {
  const initialHeaders = [
    { label: "Name" },
    { label: "Birthday" },
    { label: "Location" },
    { label: "Contact" },
    { label: "Social" },
  ];
  const [headers, setHeaders] = useState(initialHeaders);
  const [rows, setRows] = useState<string[][]>([
    ["Alice", "01/01/1990", "New York", "123-456-7890", "@alice"],
    ["Bob", "02/02/1985", "Los Angeles", "987-654-3210", "@bob"],
    ["Charlie", "03/03/1992", "Chicago", "555-555-5555", "@charlie"],
  ]);

  const [editingCell, setEditingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);

  const [anchor, setAnchor] = useState<{ r: number; c: number } | null>(null);
  const [current, setCurrent] = useState<{ r: number; c: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill("")]);
  };

  const updateCell = (r: number, c: number, value: string) => {
    const next = [...rows];
    next[r][c] = value;
    setRows(next);
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

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const initializedRows = useRef<Set<number>>(new Set());
  const [draggingRow, setDraggingRow] = useState<number | null>(null);
  useEffect(() => {
    rows.forEach((_, rowIndex) => {
      if (initializedRows.current.has(rowIndex)) return; // already initialized
      const rowEl = rowRefs.current[rowIndex];
      const handleEl = iconRefs.current[rowIndex];
      if (rowEl && handleEl) {
        draggable({
          element: rowEl,
          getInitialData: () => ({ type: "row", rowIndex }),
          dragHandle: handleEl,
          onDragStart: () => setDraggingRow(rowIndex),
          onDrop: () => setDraggingRow(null),
        });
        initializedRows.current.add(rowIndex); // mark as initialized
      }
    });
  }, [rows]);

  return (
    <div className="flex justify-center items-start min-h-screen p-6">
      <div className="flex flex-col w-full max-w-4xl border border-gray-200 rounded">
        {/* HEADER */}
        <div className="flex border-b border-gray-200">
          <TableHeader headers={headers} setHeaders={setHeaders} />
        </div>

        {/* ROWS */}
        <div>
          {rows.map((row, rowIndex) => {
            return (
              <div
                key={rowIndex}
                className={`flex border-b border-gray-100 items-center relative group ${
                  draggingRow === rowIndex ? "bg-blue-100" : ""
                }`}
                ref={(el) => (rowRefs.current[rowIndex] = el)}
              >
                <div
                  ref={(el) => (iconRefs.current[rowIndex] = el)}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 flex-col flex"
                >
                  <Squares2X2Icon className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div
                  className="absolute -left-12 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 flex-col flex"
                  onClick={() => deleteRow(rowIndex)}
                >
                  <TrashIcon className="w-3.5 h-3.5 text-gray-400" />
                </div>

                {/* CELLS */}
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
                        if (isDragging)
                          setCurrent({ r: rowIndex, c: colIndex });
                      }}
                      onMouseUp={() => setIsDragging(false)}
                      onDoubleClick={() =>
                        setEditingCell({ r: rowIndex, c: colIndex })
                      }
                      className="flex-1 py-2 px-2 text-[11px] border-r border-gray-100 last:border-none relative hover:bg-gray-50"
                    >
                      {selected && (
                        <div className="absolute inset-0 bg-blue-100 opacity-40 pointer-events-none" />
                      )}

                      {isEditing ? (
                        <input
                          value={cell}
                          onChange={(e) =>
                            updateCell(rowIndex, colIndex, e.target.value)
                          }
                          className="bg-transparent outline-none w-full text-gray-500 text-[11px] "
                        />
                      ) : (
                        <div className="text-gray-500 text-[11px] select-none min-h-[16px] ">
                          {cell}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div
          onClick={addRow}
          className="flex items-center gap-2 cursor-pointer py-1 px-2 text-[11px] text-gray-400 hover:bg-gray-50"
        >
          <PlusIcon className="w-3 h-3 text-gray-500" />
          <span>Add Row</span>
        </div>
      </div>
    </div>
  );
}

export default TestTable;
