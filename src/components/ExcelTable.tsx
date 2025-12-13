import { useEffect, useState } from "react";

const ROWS = 6;
const COLS = 4;

// Data source (truth)
const createData = () =>
  Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => `R${r}C${c}`)
  );

export default function ExcelLikeTable() {
  const [data] = useState(createData);

  const [anchor, setAnchor] = useState<{ r: number; c: number } | null>(null);
  const [current, setCurrent] = useState<{ r: number; c: number } | null>(null);
  const [focused, setFocused] = useState<{ r: number; c: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ---------- selection math ----------
  const isCellSelected = (r: number, c: number) => {
    if (!anchor || !current) return false;

    const minRow = Math.min(anchor.r, current.r);
    const maxRow = Math.max(anchor.r, current.r);
    const minCol = Math.min(anchor.c, current.c);
    const maxCol = Math.max(anchor.c, current.c);

    return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
  };

  // ---------- collect selected values ----------
  const getSelectedValues = () => {
    if (!anchor || !current) return [];

    const minRow = Math.min(anchor.r, current.r);
    const maxRow = Math.max(anchor.r, current.r);
    const minCol = Math.min(anchor.c, current.c);
    const maxCol = Math.max(anchor.c, current.c);

    const values: string[] = [];

    for (let r = minRow; r <= maxRow; r++) {
      const rowValues: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        rowValues.push(data[r][c]);
      }
      values.push(rowValues.join("\t")); // TSV like Excel
    }

    return values;
  };

  // ---------- keyboard handling ----------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focused) return;

      let { r, c } = focused;

      if (e.key === "ArrowUp") r = Math.max(r - 1, 0);
      else if (e.key === "ArrowDown") r = Math.min(r + 1, ROWS - 1);
      else if (e.key === "ArrowLeft") c = Math.max(c - 1, 0);
      else if (e.key === "ArrowRight") c = Math.min(c + 1, COLS - 1);
      else if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault();
        navigator.clipboard.writeText(getSelectedValues().join("\n"));
        return;
      } else return;

      e.preventDefault();
      setFocused({ r, c });

      if (e.shiftKey) {
        // expand selection
        setCurrent({ r, c });
      } else {
        // move single-cell selection
        setAnchor({ r, c });
        setCurrent({ r, c });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focused, anchor, current]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <table className="border-collapse border border-gray-300 select-none text-sm">
        <tbody>
          {data.map((row, r) => (
            <tr key={r}>
              {row.map((value, c) => {
                const selected = isCellSelected(r, c);
                const isFocused = focused?.r === r && focused?.c === c;

                return (
                  <td
                    key={c}
                    tabIndex={0}
                    onMouseDown={() => {
                      setAnchor({ r, c });
                      setCurrent({ r, c });
                      setFocused({ r, c });
                      setIsDragging(true);
                    }}
                    onMouseEnter={() => {
                      if (isDragging) setCurrent({ r, c });
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    className={`border border-gray-300 px-4 py-2 text-center cursor-default
                      ${selected ? "bg-red-100" : ""}
                      ${isFocused ? "" : ""}
                    `}
                  >
                    <span
                      className={selected ? "px-1 rounded" : ""}
                    >
                      {value}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() =>
          navigator.clipboard.writeText(getSelectedValues().join("\n"))
        }
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Copy selection
      </button>
    </div>
  );
}
