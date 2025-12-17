import { useState, useRef } from "react";

// Excel-like table with multi-row support + Google Sheets / Excel paste
export default function ExcelLikeTable() {
  const INITIAL_ROWS = 30;
  const INITIAL_COLS = 10;

  const [data, setData] = useState<string[][]>(
    Array.from({ length: INITIAL_ROWS }, () => Array(INITIAL_COLS).fill(""))
  );

  const tableRef = useRef<HTMLTableElement | null>(null);

  const ensureSize = (rows: number, cols: number) => {
    setData((prev) => {
      const next = prev.map((r) => [...r]);

      // add rows
      while (next.length < rows) {
        next.push(Array(Math.max(cols, next[0].length)).fill(""));
      }

      // add columns
      const maxCols = Math.max(cols, ...next.map((r) => r.length));
      return next.map((r) => {
        const row = [...r];
        while (row.length < maxCols) row.push("");
        return row;
      });
    });
  };

  const ensureExtraRow = (rowIndex: number) => {
    setData((prev) => {
      if (rowIndex < prev.length - 1) return prev;
      return [...prev, Array(prev[0].length).fill("")];
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
    e.preventDefault();

    const text = e.clipboardData.getData("text/plain");
    if (!text) return;

    const rows = text
      .replace(/\r/g, "")
      .split("\n")
      .filter(Boolean)
      .map((row) => row.split("\t"));

    const startCell = document.activeElement as HTMLInputElement | null;
    if (!startCell) return;

    const startRow = Number(startCell.dataset.row);
    const startCol = Number(startCell.dataset.col);

    ensureSize(
      startRow + rows.length,
      startCol + Math.max(...rows.map((r) => r.length))
    );

    setData((prev) => {
      const next = prev.map((r) => [...r]);

      rows.forEach((row, rIndex) => {
        row.forEach((value, cIndex) => {
          next[startRow + rIndex][startCol + cIndex] = value;
        });
      });

      return next;
    });
  };

  const updateCell = (r: number, c: number, value: string) => {
    setData((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = value;
      return next;
    });
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-2 text-sm text-gray-500">
        Copy from Google Sheets / Excel → click a cell → paste
      </div>

      <div className="overflow-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table
          ref={tableRef}
          onPaste={handlePaste}
          className="border-collapse w-full text-sm"
        >
          <tbody>
            {data.map((row, r) => (
              <tr key={r} className="hover:bg-gray-50">
                {row.map((cell, c) => (
                  <td key={c} className="border border-gray-200 px-0 py-0">
                    <input
                      data-row={r}
                      data-col={c}
                      value={cell}
                      onChange={(e) => {
                        updateCell(r, c, e.target.value);
                        ensureExtraRow(r);
                      }}
                      className="w-full h-full px-2 py-1 outline-none bg-transparent focus:bg-gray-100"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
