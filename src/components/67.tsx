// Table.tsx
import React from "react";
import { useTableStore } from "./ZustandStore"; // adjust path
import type { Column, Row } from "./ZustandStore";

export const Table = () => {
  const { columns, rows, addColumn, updateCell, deleteRow, setColumnWidth } =
    useTableStore();

  // Add row function
  const handleAddRow = () => {
    useTableStore.setState((state) => {
      const newRow: Row = {};
      state.columns.forEach((col) => (newRow[col.id] = ""));
      state.rows.push(newRow);
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() =>
            useTableStore.setState((state) => {
              state.rows.push(
                Object.fromEntries(columns.map((h) => [h.id, ""]))
              );
            })
          }
        >
          Add Row
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={addColumn}
        >
          Add Column
        </button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="border px-4 py-2 text-left"
                  style={{ width: col.width }}
                >
                  {col.name}
                </th>
              ))}
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.id} className="border px-4 py-2">
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={row[col.id]}
                      onChange={(e) =>
                        updateCell(rowIndex, col.id, e.target.value)
                      }
                    />
                  </td>
                ))}
                <td className="border px-4 py-2">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => useTableStore.getState().deleteRow(rowIndex)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
