import { useEffect, useRef, useState } from "react";
import { Squares2X2Icon, TrashIcon } from "@heroicons/react/24/solid";
import { useTableStore } from "./ZustandStore";

type ZustandCellProps = {
  rowData: Record<string, string>;
  rowIndex: number;
};

export const GridCell = ({ rowData, rowIndex }: ZustandCellProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [closestEdge, setClosestEdge] = useState<"top" | "bottom" | null>(null);

  const {
    rows,
    updateCell,
    deleteRow,
    editingCell,
    setEditingCell,
    setAnchor,
    setCurrent,
    isDragging,
    setIsDragging,
  } = useTableStore();

  const colKeys = Object.keys(rowData);

  return (
    <div
      ref={rowRef}
      className={`flex border-b border-gray-200 items-center relative group`}
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

      {colKeys.map((colId, colIndex) => {
        const isEditing =
          editingCell?.r === rowIndex && editingCell?.c === colIndex;
        const value = rowData[colId] ?? "";

        return (
          <div
            key={colId}
            className="py-2 px-2 text-[11px] border-r border-gray-200 last:border-none relative hover:bg-gray-100"
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
            {isEditing ? (
              <input
                autoFocus
                value={value}
                onChange={(e) => updateCell(rowIndex, colId, e.target.value)}
                onBlur={() => setEditingCell(null)}
                onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                className="bg-transparent outline-none w-full h-full text-gray-500 text-[11px]"
              />
            ) : (
              <div
                className="text-[11px] text-gray-500 min-h-4 select-none"
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
