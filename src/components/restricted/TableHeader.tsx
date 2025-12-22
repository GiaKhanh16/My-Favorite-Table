import { tableStore } from "./Stores/TableStore";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { TableHeaderCell } from "./TableHeaderCell";

export type Column = { id: string; name: string; width: number };
export type Row = Record<string, string>;

type TableHeaderProps = {
  columns: Column[];
  rows: Row[];
  highlightedColumns: string[];
  flashingColumns: string[];
};

export default function TableHeader({
  columns,
  rows,
  highlightedColumns,
  flashingColumns,
}: TableHeaderProps) {
  const addColumn = () => {
    const newColId = `col${columns.length + 1}`;
    const newColumn = { id: newColId, name: "New Col", width: 150 };

    tableStore.setState({
      columns: [...columns, newColumn],
      rows: rows.map((row) => ({ ...row, [newColId]: "" })),
    });
  };

  return (
    <div className="relative flex rounded bg-gray-50 ">
      {columns.map((col, index) => (
        <TableHeaderCell
          key={col.id}
          col={col}
          index={index}
          isLast={index === columns.length - 1}
          highlightedColumns={highlightedColumns}
          flashingColumns={flashingColumns}
        />
      ))}

      <button
        onClick={addColumn}
        className="
          absolute -right-6 top-1/2 -translate-y-1/2
          text-gray-400 hover:text-gray-600
        "
      >
        <PlusCircleIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
