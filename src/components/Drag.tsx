import { PlusIcon, TrashIcon, Squares2X2Icon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState, useCallback } from "react";
import TableHeader from "./subComponents/tableHeader";
import invariant from "tiny-invariant";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

// Single Row component (like Card)
const Row = ({ rowData, rowIndex, onDelete }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const rowEl = rowRef.current;
    const handleEl = handleRef.current;
    if (!rowEl || !handleEl) return;

    // Make the row draggable and a drop target
    return combine(
      draggable({
        element: rowEl,
        getInitialData: () => ({ type: "row", rowIndex }),
        dragHandle: handleEl,
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element: rowEl,
        getData: ({ input, element }) =>
          attachClosestEdge(
            { type: "row", rowIndex },
            { input, element, allowedEdges: ["top", "bottom"] }
          ),
        getIsSticky: () => true,
      })
    );
  }, [rowIndex]);

  return (
    <div
      ref={rowRef}
      className={`flex border-b border-gray-100 items-center relative group ${
        isDragging ? "bg-blue-100" : ""
      }`}
      data-row-index={rowIndex}
    >
      {/* Drag Handle */}
      <div
        ref={handleRef}
        className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 flex-col flex"
      >
        <Squares2X2Icon className="h-3.5 w-3.5 text-gray-400" />
      </div>

      {/* Delete */}
      <div
        className="absolute -left-12 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 flex-col flex"
        onClick={() => onDelete(rowIndex)}
      >
        <TrashIcon className="w-3.5 h-3.5 text-gray-400" />
      </div>

      {/* Cells */}
      {rowData.map((cell, colIndex) => (
        <div
          key={colIndex}
          className="flex-1 py-2 px-2 text-[11px] border-r border-gray-100 last:border-none relative hover:bg-gray-50"
        >
          <div className="text-gray-500 text-[11px] select-none min-h-[16px]">
            {cell}
          </div>
        </div>
      ))}
    </div>
  );
};

// Table component
const DragTable = () => {
  const initialHeaders = [
    { label: "Name" },
    { label: "Birthday" },
    { label: "Location" },
    { label: "Contact" },
    { label: "Social" },
  ];
  const [headers, setHeaders] = useState(initialHeaders);
  const [rows, setRows] = useState<string[][]>([
    ["Alice", "01/01/1990", "New York", "123-456-7890", "@alice"],
    ["Bob", "02/02/1985", "Los Angeles", "987-654-3210", "@bob"],
    ["Charlie", "03/03/1992", "Chicago", "555-555-5555", "@charlie"],
  ]);

  const reorderRow = useCallback(
    ({
      startIndex,
      finishIndex,
    }: {
      startIndex: number;
      finishIndex: number;
    }) => {
      setRows((prevRows) =>
        reorder({ list: prevRows, startIndex, finishIndex })
      );
    },
    []
  );

  // Use monitorForElements to handle reordering logic
  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        if (source.data.type !== "row") return;

        const draggedIndex = source.data.rowIndex;

        if (location.current.dropTargets.length === 1) {
          const targetRecord = location.current.dropTargets[0];
          const targetIndex = targetRecord.data.rowIndex;

          if (draggedIndex === targetIndex) return;

          const destinationIndex = getReorderDestinationIndex({
            startIndex: draggedIndex,
            indexOfTarget: targetIndex,
            closestEdgeOfTarget: null,
            axis: "vertical",
          });

          reorderRow({
            startIndex: draggedIndex,
            finishIndex: destinationIndex,
          });
        }
      },
    });
  }, [reorderRow]);

  const addRow = () => setRows([...rows, Array(headers.length).fill("")]);
  const deleteRow = (rowIndex: number) =>
    setRows(rows.filter((_, i) => i !== rowIndex));

  return (
    <div className="flex justify-center items-start min-h-screen p-6">
      <div className="flex flex-col w-full max-w-4xl border border-gray-200 rounded">
        <div className="flex border-b border-gray-200">
          <TableHeader headers={headers} setHeaders={setHeaders} />
        </div>

        <div>
          {rows.map((row, rowIndex) => (
            <Row
              key={rowIndex}
              rowData={row}
              rowIndex={rowIndex}
              onDelete={deleteRow}
            />
          ))}
        </div>

        <div
          onClick={addRow}
          className="flex items-center gap-2 cursor-pointer py-1 px-2 text-[11px] text-gray-400 hover:bg-gray-50"
        >
          <PlusIcon className="w-3 h-3 text-gray-500" />
          <span>Add Row</span>
        </div>
      </div>
    </div>
  );
};

export default DragTable;
