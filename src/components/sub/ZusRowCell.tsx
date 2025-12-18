import { useEffect, useRef } from "react";
import { useTableStore, type Column, type Row } from "../ZustandStore";
import { handlePasteEvent } from "../utils/ZusUtil";

type ZustandCellItemProps = {
  rowData: Row;
  rowIndex: number;
  col: Column;
  colIndex: number;
};

export const ZustandCellItem = ({
  rowData,
  rowIndex,
  col,
  colIndex,
}: ZustandCellItemProps) => {
  const {
    updateCell,
    isCellSelected,
    editingCell,
    setEditingCell,
    setAnchor,
    setCurrent,
    isDragging,
    setIsDragging,
    setColumnWidth,
    rows,
    columns,
  } = useTableStore();

  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const selected = isCellSelected(rowIndex, colIndex);
  const isEditing = editingCell?.r === rowIndex && editingCell?.c === colIndex;
  const value = rowData[col.id] ?? "";

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    handlePasteEvent(e, rowIndex, colIndex, rows, columns, updateCell);
  };

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
      resizeHandleRef.current?.removeEventListener("mousedown", onMouseDown);
  }, [col.width, col.id]);

  return (
    <div
      className=" py-2 px-2 text-[11px] border-r border-gray-200 last:border-none relative hover:bg-gray-100 "
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
          onPaste={onPaste}
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
          onDoubleClick={() => setEditingCell({ r: rowIndex, c: colIndex })}
        >
          {value}
        </div>
      )}
    </div>
  );
};
