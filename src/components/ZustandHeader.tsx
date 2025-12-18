import { useTableStore } from "./ZustandStore";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { ZusHeaderCell } from "./sub/ZusHeaderCell";

export default function ZustandHeader() {
  const columns = useTableStore((s) => s.columns);
  const addColumn = useTableStore((s) => s.addColumn);

  return (
    <div className="relative group flex rounded bg-gray-50 ">
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
          absolute -right-6 top-1/2 -translate-y-1/2
          opacity-0 group-hover:opacity-100
          transition-opacity
          text-gray-400 hover:text-gray-600
          z-30
        "
      >
        <PlusCircleIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
