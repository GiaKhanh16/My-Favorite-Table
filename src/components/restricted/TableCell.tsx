export type Column = { id: string; name: string; width: number };

export type Row = Record<string, string>;

type Pos = { r: number; c: number } | null;

type TableCellProps = {
  rowData: Row;
  rowIndex: number;
  col: Column;
  colIndex: number;
  updateCell: (rowIndex: number, colId: string, value: string) => void;
  isCellSelected: (r: number, c: number) => boolean;
  editingCell: Pos;
  setEditingCell: (pos: Pos) => void;
  setAnchor: (pos: Pos) => void;
  setCurrent: (pos: Pos) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  pasteData: (
    startRow: number,
    startCol: number,
    clipboardText: string
  ) => void;
  columns: Column[];
  rows: Row[];
};

export const TableCell = ({
  rowData,
  rowIndex,
  col,
  colIndex,
  updateCell,
  isCellSelected,
  editingCell,
  setEditingCell,
  setAnchor,
  setCurrent,
  isDragging,
  setIsDragging,
  pasteData,
  columns,
  rows,
}: TableCellProps) => {
  const selected = isCellSelected(rowIndex, colIndex);
  const isEditing = editingCell?.r === rowIndex && editingCell?.c === colIndex;
  const value = rowData[col.id] ?? "";

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const clipboardHTML = e.clipboardData.getData("text/html") || "";
    const clipboardText = e.clipboardData.getData("text/plain") || "";

    let dataToPaste = clipboardText; // fallback

    if (clipboardHTML.startsWith("<table")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(clipboardHTML, "text/html");
      const table = doc.querySelector("table");

      if (table) {
        const rows: string[][] = [];
        table.querySelectorAll("tr").forEach((tr) => {
          const rowValues: string[] = [];
          tr.querySelectorAll("th, td").forEach((cell) => {
            rowValues.push(cell.textContent || "");
          });
          rows.push(rowValues);
        });

        // Optionally skip header
        if (rows.length > 0) rows.shift();

        dataToPaste = rows.map((r) => r.join("\t")).join("\n");
      }
    }

    pasteData(rowIndex, colIndex, dataToPaste);
  };

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
          onPaste={handlePaste}
          onChange={(e) => updateCell(rowIndex, col.id, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              e.stopPropagation();

              setEditingCell(null);

              const colCount = columns.length;
              const rowCount = rows.length;

              let nextR = rowIndex;
              let nextC = colIndex;

              if (e.shiftKey) {
                nextC = Math.max(0, colIndex - 1);
              } else {
                if (colIndex < colCount - 1) {
                  nextC = colIndex + 1;
                } else {
                  nextC = 0;
                  nextR = Math.min(rowCount - 1, rowIndex + 1);
                }
              }

              setAnchor({ r: nextR, c: nextC });
              setCurrent({ r: nextR, c: nextC });
            }
          }}
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
