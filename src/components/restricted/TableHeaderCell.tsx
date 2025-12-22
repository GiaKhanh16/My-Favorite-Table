import { useEffect, useRef, useState } from "react";
import { tableStore } from "./Stores/TableStore";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { TrashIcon } from "@heroicons/react/24/solid";
import { GlobalViewControl } from "./Stores/TableStore";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
type Column = { id: string; name: string; width: number };

export type Row = Record<string, string>;
export function TableHeaderCell({
  col,
  index,
  isLast,
  highlightedColumns,
  flashingColumns,
}: {
  col: Column;
  index: number;
  isLast: boolean;
  highlightedColumns: string[];
  flashingColumns: string[];
}) {
  const columnRef = useRef<HTMLLabelElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const { view } = GlobalViewControl();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isSelected = flashingColumns.includes(col.id);
  const deleteColumn = (id: string) => {
    tableStore.setState((state) => {
      state.columns = state.columns.filter((c) => c.id !== id);
      state.rows.forEach((row) => {
        delete row[id];
      });
    });
  };

  const setColumnName = (colId: string, name: string) => {
    tableStore.setState((state) => {
      const col = state.columns.find((c) => c.id === colId);
      if (col) col.name = name;
    });
  };

  const setColumnWidth = (colId: string, width: number) => {
    tableStore.setState((state) => {
      const col = state.columns.find((c) => c.id === colId);
      if (col) col.width = width;
    });
  };

  const reorderColumn = (startIndex: number, finishIndex: number) => {
    tableStore.setState((state) => {
      state.columns = reorder({
        list: state.columns,
        startIndex,
        finishIndex,
      });
      state.rows = state.rows.map((row) => {
        const newRow: Row = {};
        state.columns.forEach((col) => {
          newRow[col.id] = row[col.id];
        });
        return newRow;
      });
    });
  };
  useEffect(() => {
    if (!resizeHandleRef.current) return;

    let startX = 0;
    let startWidth = col.width;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      setColumnWidth(col.id, Math.max(30, startWidth + delta));
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startX = e.clientX;
      startWidth = col.width;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    resizeHandleRef.current.addEventListener("mousedown", onMouseDown);
    return () =>
      resizeHandleRef.current?.removeEventListener("mousedown", onMouseDown);
  }, [col.width, col.id, setColumnWidth]);

  useEffect(() => {
    const el = columnRef.current;
    if (!el || isResizing) return;

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
  }, [col.id, index, reorderColumn, isResizing]);

  return (
    <label
      ref={columnRef}
      style={{
        width: col.width,
        flex: "none",
        fontWeight: 500,
        transition: "background 0.3s ease",
      }}
      className={` group
  relative flex items-center gap-2 px-2 py-2 text-[11px]
  text-gray-400 hover:bg-gray-100
  ${!isLast ? "border-r border-gray-200" : ""}
  ${isDragging ? "bg-blue-100 shadow-lg scale-105 z-20" : ""}
   ${
     highlightedColumns.includes(col.id)
       ? "bg-gray-50"
       : isSelected
       ? "bg-gray-200"
       : ""
   }
`}
    >
      {view == "table" ? (
        <input
          className="bg-transparent outline-none w-full text-[11px]"
          value={col.name}
          onChange={(e) => setColumnName(col.id, e.target.value)}
        />
      ) : (
        <div className="bg-transparent outline-none w-full text-[11px] min-h-4"></div>
      )}

      <button
        className="
    absolute right-3 top-1/2 -translate-y-1/2
    opacity-0 group-hover:opacity-100
    transition-opacity
    text-gray-400
    z-20
  "
      >
        <TrashIcon className="w-3 h-3" onClick={() => deleteColumn(col.id)} />
      </button>
      <div
        ref={resizeHandleRef}
        style={{ pointerEvents: "auto" }}
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize z-10"
      />
    </label>
  );
}
