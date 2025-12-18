import { useTableStore } from "./ZustandStore";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ZusHeaderCell } from "./sub/ZusHeaderCell";

export default function ZustandHeader() {
  const columns = useTableStore((s) => s.columns);
  const addColumn = useTableStore((s) => s.addColumn);

  return (
    <div className="relative group flex bg-gray-50">
      {columns.map((col, index) => (
        <ZusHeaderCell
          key={col.id}
          col={col}
          index={index}
          isLast={index === columns.length - 1}
        />
      ))}

      {/* Plus icon */}
      <button
        onClick={addColumn}
        className="
          absolute -right-7 top-1/2 -translate-y-1/2
          opacity-0 group-hover:opacity-100
          transition-opacity
          text-gray-400 hover:text-gray-600
          z-30
        "
      >
        <PlusIcon className="w-3 h-3" />
      </button>
    </div>
  );
}
