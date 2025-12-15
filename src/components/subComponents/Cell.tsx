import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import type { DataRowProps } from "../utils/types";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Squares2X2Icon, TrashIcon } from "@heroicons/react/24/solid";

export const Cell = ({
  rowData,
  rowIndex,
  onDelete,
  updateCell,
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
  const [draggingRow, setDraggingRow] = useState<number | null>(null);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  type Edge = "top" | "bottom";

  useEffect(() => {
    const rowEl = rowRef.current;
    const handleEl = handleRef.current;
    if (!rowEl || !handleEl) return;

    return combine(
      draggable({
        element: rowEl,
        getInitialData: () => ({ type: "row", rowIndex }),
        dragHandle: handleEl,
        onDragStart: () => {
          setIsDragging(true);
          setDraggingRow(rowIndex);
        },
        onDrop: () => {
          setIsDragging(false);
          setDraggingRow(null);
        },
      }),
      dropTargetForElements({
        element: rowEl,
        getData: ({ input, element }) =>
          attachClosestEdge(
            { type: "row", rowIndex },
            { input, element, allowedEdges: ["top", "bottom"] }
          ),
        getIsSticky: () => true,
        onDragEnter: (args) => {
          if (args.source.data.rowIndex !== rowIndex) {
            setClosestEdge(extractClosestEdge(args.self.data) as Edge | null);
          }
        },

        onDrag: (args) => {
          if (args.source.data.rowIndex !== rowIndex) {
            setClosestEdge(extractClosestEdge(args.self.data) as Edge | null);
          }
        },
        onDragLeave: () => {
          // Reset the closest edge when the draggable item leaves the drop zone
          setClosestEdge(null);
        },
        onDrop: () => {
          // Reset the closest edge when the draggable item is dropped
          setDraggingRow(null);
          setClosestEdge(null);
        },
      })
    );
  }, [rowIndex, setIsDragging]);

  return (
    <div
      ref={rowRef}
      className={`flex border-b border-gray-100 items-center relative group ${
        draggingRow === rowIndex ? "bg-blue-100" : ""
      }`}
    >
      {/* Trash icon */}
      <div
        className="absolute -left-11 top-1/2 transform -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={() => onDelete(rowIndex)}
      >
        <TrashIcon className="w-3.5 h-3.5 text-gray-400" />
      </div>

      {/* Drag handle */}
      <div
        ref={handleRef}
        className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 flex-col flex"
      >
        <Squares2X2Icon className="h-3.5 w-3.5 text-gray-400" />
      </div>

      {/* Row cells */}
      {rowData.map((cell, colIndex) => {
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
            className="flex-1 py-2 px-2 text-[11px] border-r border-gray-100 last:border-none relative hover:bg-gray-50"
          >
            {selected && (
              <div className="absolute inset-0 bg-blue-100 opacity-40 pointer-events-none " />
            )}
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={cell}
                onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
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
                {cell}
              </div>
            )}
          </div>
        );
      })}
      {closestEdge && <DropIndicator edge={closestEdge} gap="0px" />}
    </div>
  );
};
const DropIndicator = ({
  edge,
  gap,
}: {
  edge: "top" | "bottom";
  gap: string;
}) => {
  const isTop = edge === "top";

  return (
    <div
      className={`absolute left-1 top-0 right-0 bg-blue-300 h-0.75 z-10 pointer-events-none`}
      style={{
        top: isTop ? `calc(-0.65 * (${gap} + 2px))` : undefined,
        bottom: !isTop ? `calc(-0.65 * (${gap} + 2px))` : undefined,
      }}
    >
      {/* Small circle indicator */}
      <span
        className="absolute w-1.5 h-1.5 border-2 border-blue-500 rounded-full"
        style={{
          top: "-4px",
          left: "-10px",
        }}
      ></span>
    </div>
  );
};
