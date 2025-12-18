import { useEffect, useRef, useState } from "react";
import { useTableStore } from "../ZustandStore";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

type Column = { id: string; name: string; width: number };

export function ZusHeaderCell({
  col,
  index,
  isLast,
}: {
  col: Column;
  index: number;
  isLast: boolean;
}) {
  const columnRef = useRef<HTMLLabelElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const setColumnWidth = useTableStore((s) => s.setColumnWidth);
  const reorderColumn = useTableStore((s) => s.reorderColumn);
  const setColumnName = useTableStore((s) => s.setColumnName);

  const [isDragging, setIsDragging] = useState(false);

  // Resize
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
      resizeHandleRef.current?.removeEventListener("mousedown", onMouseDown);
  }, [col.width, col.id, setColumnWidth]);

  // Drag & drop
  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({
          type: "col",
          colId: col.id,
          startIndex: index,
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element: el,
        getData: ({ input, element }) =>
          attachClosestEdge(
            { type: "col", colId: col.id, index },
            { input, element, allowedEdges: ["left", "right"] }
          ),
        getIsSticky: () => true,
        onDragEnter: ({ source }) => {
          if (source.data.type === "col" && source.data.colId !== col.id) {
            const startIndex = source.data.startIndex as number;
            reorderColumn(startIndex, index);
            source.data.startIndex = index;
          }
        },
      })
    );
  }, [col.id, index, reorderColumn]);

  return (
    <label
      ref={columnRef}
      style={{ width: col.width, flex: "none", fontWeight: 500 }}
      className={`
        relative flex items-center gap-2 px-2 py-2 text-[11px]
        text-gray-400 hover:bg-gray-100 transition-all duration-200
        ${!isLast ? "border-r border-gray-200" : ""}
        ${isDragging ? "bg-blue-100 shadow-lg scale-105 z-20" : "bg-gray-50"}
      `}
    >
      <input
        className="bg-transparent outline-none w-full text-[11px]"
        value={col.name}
        onChange={(e) => setColumnName(col.id, e.target.value)}
      />

      {/* resize handle */}
      <div
        ref={resizeHandleRef}
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize z-10"
      />
    </label>
  );
}
