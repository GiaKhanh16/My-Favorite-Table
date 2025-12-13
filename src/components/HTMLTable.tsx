import { useState, useEffect } from "react";

const ROWS = 6;
const COLS = 5;

export default function DragSelectTable() {
  const [focused, setFocused] = useState<{ r: number; c: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // Encode a cell as "r,c" for Set
  const cellKey = (r: number, c: number) => `${r},${c}`;

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focused) return;

      let { r, c } = focused;
      if (e.key === "ArrowUp") r = Math.max(r - 1, 0);
      else if (e.key === "ArrowDown") r = Math.min(r + 1, ROWS - 1);
      else if (e.key === "ArrowLeft") c = Math.max(c - 1, 0);
      else if (e.key === "ArrowRight") c = Math.min(c + 1, COLS - 1);
      else return;

      e.preventDefault();
      setFocused({ r, c });
      setSelectedCells((prev) => new Set(prev).add(cellKey(r, c)));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focused]);

  const isSelected = (r: number, c: number) => selectedCells.has(cellKey(r, c));

  return (
    <div className="flex justify-center items-center h-screen select-none">
      <table className="border-collapse border border-gray-300 max-w-4xl w-full text-[11px]">
        <tbody>
          {Array.from({ length: ROWS }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: COLS }).map((_, colIndex) => {
                const isFocus =
                  focused?.r === rowIndex && focused?.c === colIndex;

                return (
                  <td
                    key={colIndex}
                    onMouseDown={() => {
                      setFocused({ r: rowIndex, c: colIndex });
                      setIsDragging(true);
                      setSelectedCells(new Set([cellKey(rowIndex, colIndex)]));
                    }}
                    onMouseEnter={() => {
                      if (isDragging) {
                        setSelectedCells((prev) =>
                          new Set(prev).add(cellKey(rowIndex, colIndex))
                        );
                      }
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    className={`border border-gray-300 text-center cursor-default select-text
                      ${isSelected(rowIndex, colIndex) ? "bg-gray-200" : ""}
                      ${isFocus ? "outline outline-2 outline-blue-500" : ""}
                    `}
                    style={{ padding: "8px", width: "60px", height: "40px" }}
                  >
                    {rowIndex},{colIndex}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
