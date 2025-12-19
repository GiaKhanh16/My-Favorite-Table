import { TableCellsIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useViewStore } from "../utils/Toggle";

export default function ViewToggle() {
  const { view, setView } = useViewStore();

  return (
    <div className="flex justify-center items-center h-auto">
      <div className="relative inline-flex rounded-md border border-gray-200 p-0.5 bg-gray-200">
        <div
          className={`absolute top-0.5 left-0.5 h-5 rounded-md transition-all duration-300 bg-white
              ${
                view === "table"
                  ? "w-14.25 translate-x-0"
                  : "w-13.25  translate-x-14.5"
              }
            `}
        />

        <button
          onClick={() => setView("table")}
          className={`relative font-medium flex items-center gap-1 px-1.5 py-0.5 ${
            view === "table" ? "text-black" : "text-gray-400"
          }`}
        >
          <TableCellsIcon className="h-3 w-3" />
          <span className="text-xs">Table</span>
        </button>
        <button
          onClick={() => setView("grid")}
          className={`relative font-medium flex items-center gap-1 px-1.5 py-0.5  z-10 ${
            view === "grid" ? "text-black" : "text-gray-400"
          }`}
        >
          <Squares2X2Icon className="h-3 w-3" />
          <span className="text-xs">Grid</span>
        </button>
      </div>
    </div>
  );
}
