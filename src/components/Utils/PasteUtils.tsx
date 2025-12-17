// pasteUtils.ts
import type { Row } from "../ZustandStore";

// Generic function to handle pasting tabular data
export function handlePasteEvent(
  e: React.ClipboardEvent,
  startRow: number,
  startCol: number,
  currentData: Row[],
  updateCell: (rowIndex: number, colId: string, value: string) => void,
  ensureSize: (rows: number, cols: number) => void
) {
  e.preventDefault();

  const text = e.clipboardData.getData("text/plain");
  if (!text) return;

  // Parse clipboard text into rows & columns
  const rows = text
    .replace(/\r/g, "")
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("\t"));

  // Make sure table can hold all pasted cells
  ensureSize(
    startRow + rows.length,
    startCol + Math.max(...rows.map((r) => r.length))
  );

  // Apply values
  rows.forEach((row, rIndex) => {
    row.forEach((value, cIndex) => {
      const col = Object.keys(currentData[startRow + rIndex])[
        startCol + cIndex
      ];
      if (col) updateCell(startRow + rIndex, col, value);
    });
  });
}
