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
import { useTableStore } from "./ZustandStore";
import type { Column, Row } from "./ZustandStore";
import { handlePasteEvent } from "./utils/PasteUtils";

type ZustandCellProps = {
  rowData: Row;
  rowIndex: number;
  headers: Column[];
};

export const ZustandCell = ({
  rowData,
  rowIndex,
  headers,
}: ZustandCellProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [closestEdge, setClosestEdge] = useState<"top" | "bottom" | null>(null);

  // ---------------- Zustand ----------------
  const {
    rows,
    updateCell,
    deleteRow,
    isCellSelected,
    editingCell,
    setEditingCell,
    setAnchor,
    setCurrent,
    isDragging,
    setIsDragging,
    setColumnWidth,
    ensureSize,
  } = useTableStore();

  const onPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    handlePasteEvent(e, rowIndex, colIndex, rows, updateCell, ensureSize);
  };

  // ---------------- drag setup ----------------
  useEffect(() => {
    if (!rowRef.current || !handleRef.current) return;
    if (editingCell) return; // do not drag while editing

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
              extractClosestEdge(args.self.data) as "top" | "bottom"
            );
          }
        },
        onDrag: (args) => {
          if (args.source.data.rowIndex !== rowIndex) {
            setClosestEdge(
              extractClosestEdge(args.self.data) as "top" | "bottom"
            );
          }
        },
        onDragLeave: () => setClosestEdge(null),
        onDrop: () => setClosestEdge(null),
      })
    );
  }, [rowIndex, setIsDragging, editingCell]);

  return (
    <div
      ref={rowRef}
      className="flex  border-b border-gray-100 items-center relative group"
    >
      {/* Trash icon */}
      <div
        className="absolute -left-11 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100"
        onClick={() => deleteRow(rowIndex)}
      >
        <TrashIcon className="w-3.5 h-3.5 text-gray-400" />
      </div>

      {/* Drag handle */}
      <div
        ref={handleRef}
        className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100"
      >
        <Squares2X2Icon className="h-3.5 w-3.5 text-gray-400" />
      </div>

      {/* Cells */}
      {headers.map((col, colIndex) => {
        const selected = isCellSelected(rowIndex, colIndex);
        const isEditing =
          editingCell?.r === rowIndex && editingCell?.c === colIndex;
        const value = rowData[col.id] ?? "";
        const resizeHandleRef = useRef<HTMLDivElement>(null);

        // ---------------- column resize ----------------
        useEffect(() => {
          if (!resizeHandleRef.current) return;
          let startX = 0;
          let startWidth = col.width;

          const onMouseMove = (e: MouseEvent) => {
            const delta = e.clientX - startX;
            setColumnWidth(col.id, Math.max(30, startWidth + delta));
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          const onMouseDown = (e: MouseEvent) => {
            e.stopPropagation();
            startX = e.clientX;
            startWidth = col.width;
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          };

          resizeHandleRef.current.addEventListener("mousedown", onMouseDown);
          return () =>
            resizeHandleRef.current?.removeEventListener(
              "mousedown",
              onMouseDown
            );
        }, [col.width, col.id]);
        return (
          <div
            key={col.id}
            className=" py-2 px-2 text-[11px] border-r border-gray-100 last:border-none relative hover:bg-gray-50"
            style={{ width: col.width }}
            onMouseDown={() => {
              if (isEditing) return;
              setAnchor({ r: rowIndex, c: colIndex });
              setCurrent({ r: rowIndex, c: colIndex });
              setIsDragging(true);
            }}
            onMouseEnter={() => {
              if (isDragging) setCurrent({ r: rowIndex, c: colIndex });
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
                onPaste={(e) => onPaste(e, rowIndex, colIndex)}
                onChange={(e) => updateCell(rowIndex, col.id, e.target.value)}
                onBlur={() => setEditingCell(null)}
                onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent outline-none w-full h-full text-gray-500 text-[11px]"
              />
            ) : (
              <div
                className=" text-[11px] text-gray-500 min-h-4 select-none"
                onDoubleClick={() =>
                  setEditingCell({ r: rowIndex, c: colIndex })
                }
              >
                {value}
              </div>
            )}
            <div
              ref={resizeHandleRef}
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-10"
            />
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
