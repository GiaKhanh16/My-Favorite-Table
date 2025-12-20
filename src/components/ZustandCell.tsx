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
import type { Row } from "./ZustandStore";
import { ZustandCellItem } from "./sub/ZusRowCell";

type ZustandCellProps = {
  rowData: Row;
  rowIndex: number;
};

export const ZustandCell = ({ rowData, rowIndex }: ZustandCellProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [closestEdge, setClosestEdge] = useState<"top" | "bottom" | null>(null);

  const { deleteRow, editingCell, setIsDragging, columns } = useTableStore();

  useEffect(() => {
    if (!rowRef.current || !handleRef.current) return;
    if (editingCell) return;

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
      className="flex border-b border-gray-200 items-center relative group"
    >
      <div
        className="absolute -left-11 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100"
        onClick={() => deleteRow(rowIndex)}
      >
        <TrashIcon className="w-3.5 h-3.5 text-gray-400" />
      </div>

      <div
        ref={handleRef}
        className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100"
      >
        <Squares2X2Icon className="h-3.5 w-3.5 text-gray-400" />
      </div>

      {columns.map((col, colIndex) => (
        <ZustandCellItem
          key={col.id}
          rowData={rowData}
          rowIndex={rowIndex}
          col={col}
          colIndex={colIndex}
        />
      ))}

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
