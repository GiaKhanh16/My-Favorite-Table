import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import type { Column, Row } from "../ZustandStore";

export const getDestinationIndex = ({
  startIndex,
  targetIndex,
}: {
  startIndex: number;
  targetIndex: number;
}) =>
  getReorderDestinationIndex({
    startIndex,
    indexOfTarget: targetIndex,
    closestEdgeOfTarget: null,
    axis: "vertical",
  }) as number;

export const copySelected = async (
  rows: Row[],
  columns: Column[],
  anchor: { r: number; c: number } | null,
  current: { r: number; c: number } | null
) => {
  if (!anchor || !current) return;

  const minRow = Math.min(anchor.r, current.r);
  const maxRow = Math.max(anchor.r, current.r);
  const minCol = Math.min(anchor.c, current.c);
  const maxCol = Math.max(anchor.c, current.c);

  let html = `<table style="border-collapse: collapse;">`;
  const textRows: string[] = [];

  for (let r = minRow; r <= maxRow; r++) {
    html += `<tr>`;
    const rowValues: string[] = [];

    for (let c = minCol; c <= maxCol; c++) {
      const colId = columns[c].id;
      const val = rows[r][colId] ?? "";
      html += `<td style="border:1px solid #000; padding:2px 6px;">${val}</td>`;
      rowValues.push(val);
    }

    html += `</tr>`;
    textRows.push(rowValues.join("\t"));
  }

  html += `</table>`;
  const text = textRows.join("\n");

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
  } catch {
    await navigator.clipboard.writeText(text);
  }
};

export function handlePasteEvent(
  e: React.ClipboardEvent,
  startRow: number,
  startCol: number,
  rows: Row[],
  columns: Column[],
  updateCell: (rowIndex: number, colId: string, value: string) => void
) {
  e.preventDefault();

  const text = e.clipboardData.getData("text/plain");
  if (!text) return;

  // Parse clipboard text into rows & columns
  const pastedData = text
    .replace(/\r/g, "")
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("\t"));

  // Compute how many rows and columns we can paste
  const availableRows = rows.length - startRow;
  const rowsToPaste = pastedData.slice(0, availableRows);

  const availableCols = columns.length - startCol;

  // Apply values, bounded by table size
  rowsToPaste.forEach((rowData, rIndex) => {
    rowData.forEach((value, cIndex) => {
      if (cIndex >= availableCols) return; // skip overflow columns
      const colId = columns[startCol + cIndex]?.id;
      if (colId) updateCell(startRow + rIndex, colId, value);
    });
  });
}
