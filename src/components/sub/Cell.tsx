import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Squares2X2Icon, TrashIcon } from "@heroicons/react/24/solid";
import type { Column, Row } from "../ZustandStore";

type DataRowProps = {
  rowData: Row;
  rowIndex: number;
  headers: Column[];

  updateCell: (rowIndex: number, colId: string, value: string) => void;
  deleteRow: (rowIndex: number) => void;

  isCellSelected: (r: number, c: number) => boolean;

  editingCell: { r: number; c: number } | null;
  setEditingCell: (pos: { r: number; c: number } | null) => void;
  setAnchor: (pos: { r: number; c: number } | null) => void;
  setCurrent: (pos: { r: number; c: number } | null) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
};

export const Cell = ({
  rowData,
  rowIndex,
  headers,
  updateCell,
  deleteRow,
  isCellSelected,
  editingCell,
  setEditingCell,
  setAnchor,
  setCurrent,
  isDragging,
  setIsDragging,
}: DataRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [closestEdge, setClosestEdge] = useState<"top" | "bottom" | null>(null);

  useEffect(() => {
    if (!rowRef.current || !handleRef.current) return;

    return combine(
      draggable({
        element: rowRef.current,
        dragHandle: handleRef.current,
        getInitialData: () => ({ type: "row", rowIndex }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element: rowRef.current,
        getData: ({ input, element }) =>
          attachClosestEdge(
            { type: "row", rowIndex },
            { input, element, allowedEdges: ["top", "bottom"] }
          ),
        getIsSticky: () => true,
        onDragEnter: (args) => {
          if (args.source.data.rowIndex !== rowIndex) {
            setClosestEdge(
              extractClosestEdge(args.self.data) as "top" | "bottom" | null
            );
          }
        },
        onDrag: (args) => {
          if (args.source.data.rowIndex !== rowIndex) {
            setClosestEdge(
              extractClosestEdge(args.self.data) as "top" | "bottom" | null
            );
          }
        },
        onDragLeave: () => setClosestEdge(null),
        onDrop: () => setClosestEdge(null),
      })
    );
  }, [rowIndex, setIsDragging]);

  return (
    <div
      ref={rowRef}
      className="flex border-b border-gray-100 items-center relative group"
    >
      <div
        className="absolute -left-11 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-pointer"
        onClick={() => deleteRow(rowIndex)}
      >
        <TrashIcon className="w-3.5 h-3.5 text-gray-400" />
      </div>

      <div
        ref={handleRef}
        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <Squares2X2Icon className="h-3.5 w-3.5 text-gray-400" />
      </div>

      {headers.map((col, colIndex) => {
        const selected = isCellSelected(rowIndex, colIndex);
        const isEditing =
          editingCell?.r === rowIndex && editingCell?.c === colIndex;
        const value = rowData[col.id] ?? "";

        return (
          <div
            key={col.id}
            className="flex-1 py-2 px-2 text-[11px] border-r border-gray-100 last:border-none relative"
            onMouseDown={() => {
              setAnchor({ r: rowIndex, c: colIndex });
              setCurrent({ r: rowIndex, c: colIndex });
              setIsDragging(true);
            }}
            onMouseEnter={() => {
              if (isDragging) {
                setCurrent({ r: rowIndex, c: colIndex });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
          >
            {selected && (
              <div className="absolute inset-0 bg-blue-100 opacity-40 pointer-events-none" />
            )}

            {isEditing ? (
              <input
                autoFocus
                value={value}
                onChange={(e) => updateCell(rowIndex, col.id, e.target.value)}
                onBlur={() => setEditingCell(null)}
                onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                className="bg-transparent outline-none w-full h-full text-gray-500 text-[11px]"
              />
            ) : (
              <div
                className="flex-1 text-[11px] text-gray-500 min-h-4 select-none"
                onDoubleClick={() =>
                  setEditingCell({ r: rowIndex, c: colIndex })
                }
              >
                {value}
              </div>
            )}
          </div>
        );
      })}

      {closestEdge && (
        <div
          className={`absolute left-1 right-0 h-0.5 bg-blue-300 ${
            closestEdge === "top" ? "top-0" : "bottom-0"
          }`}
        />
      )}
    </div>
  );
};
