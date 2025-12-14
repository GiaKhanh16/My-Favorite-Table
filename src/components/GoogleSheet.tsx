import { useState } from "react";

const initialData = [
  ["Alice", "01/01/1990"],
  ["Bob", "02/02/1985"],
  ["Charlie", "03/03/1992"],
];

export default function SimpleSheet() {
  const [rows, setRows] = useState(initialData);
  const [anchor, setAnchor] = useState<{ r: number; c: number } | null>(null);
  const [current, setCurrent] = useState<{ r: number; c: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);

  const isCellSelected = (r: number, c: number) => {
    if (!anchor || !current) return false;
    const minR = Math.min(anchor.r, current.r);
    const maxR = Math.max(anchor.r, current.r);
    const minC = Math.min(anchor.c, current.c);
    const maxC = Math.max(anchor.c, current.c);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  const updateCell = (r: number, c: number, value: string) => {
    const newRows = [...rows];
    newRows[r][c] = value;
    setRows(newRows);
  };

  return (
    <div className="p-4">
      {rows.map((row, r) => (
        <div key={r} className="flex">
          {row.map((cell, c) => {
            const selected = isCellSelected(r, c);
            const isEditing = editingCell?.r === r && editingCell?.c === c;
            return (
              <div
                key={c}
                className="relative border px-2 py-1 w-24 h-8"
                onMouseDown={() => {
                  setAnchor({ r, c });
                  setCurrent({ r, c });
                  setIsDragging(true);
                }}
                onMouseEnter={() => {
                  if (isDragging) setCurrent({ r, c });
                }}
                onMouseUp={() => setIsDragging(false)}
                onDoubleClick={() => setEditingCell({ r, c })}
              >
                {/* Overlay */}
                {selected && (
                  <div className="absolute inset-0 bg-blue-200 opacity-40 pointer-events-none"></div>
                )}

                {/* Cell content */}
                {isEditing ? (
                  <input
                    autoFocus
                    value={cell}
                    onChange={(e) => updateCell(r, c, e.target.value)}
                    onBlur={() => setEditingCell(null)}
                    className="w-full h-full outline-none bg-transparent"
                  />
                ) : (
                  <div className="w-full h-full select-none">{cell}</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
