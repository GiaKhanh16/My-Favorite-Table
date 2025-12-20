// DataRows.tsx
import { PlusIcon } from "@heroicons/react/24/solid";
import { useEffect, useCallback, useMemo } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { copySelected, getDestinationIndex } from "./utils/ZusUtil";
import { useTableStore } from "./ZustandStore";
import { ZustandCell } from "./ZustandCell";

export function ZustandRow() {
  const {
    columns,
    rows,
    anchor,
    current,
    editingCell,
    updateCell,
    reorderRow,
    setAnchor,
    setCurrent,
    setEditingCell,
  } = useTableStore();

  const handleReorder = useCallback(
    ({
      startIndex,
      finishIndex,
    }: {
      startIndex: number;
      finishIndex: number;
    }) => {
      reorderRow(startIndex, finishIndex);
    },
    [reorderRow]
  );
  
  const selectedColumnIds = useMemo(() => {
    if (!anchor || !current) return [];
    const minCol = Math.min(anchor.c, current.c);
    const maxCol = Math.max(anchor.c, current.c);
    return columns.slice(minCol, maxCol + 1).map((c) => c.id);
  }, [anchor, current, columns]);

  // Set it in Zustand so headers can read it
  useEffect(() => {
    useTableStore.setState({ selectedColumns: selectedColumnIds });
  }, [selectedColumnIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        if (!anchor || !current) return;
        e.preventDefault();

        copySelected(rows, columns, anchor, current);

        const minCol = Math.min(anchor.c, current.c);
        const maxCol = Math.max(anchor.c, current.c);
        const columnsToHighlight = columns
          .slice(minCol, maxCol + 1)
          .map((col) => col.id);

        useTableStore.getState().setHighlightedColumns(columnsToHighlight);

        setTimeout(() => {
          useTableStore.getState().setHighlightedColumns([]);
        }, 150);

        return;
      }

      if (
        current &&
        !editingCell &&
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        const { r, c } = current;
        const colId = columns[c].id;

        updateCell(r, colId, e.key);
        setEditingCell({ r, c });
        return;
      }

      if (current && !editingCell && (e.key === "Enter" || e.key === "F2")) {
        e.preventDefault();
        setEditingCell({ r: current.r, c: current.c });
        return;
      }

      if (e.key === "Tab") {
        if (!current || editingCell) return;

        e.preventDefault();

        let { r, c } = current;

        if (e.shiftKey) {
          c = Math.max(0, c - 1);
        } else {
          if (c < columns.length - 1) {
            c += 1;
          } else {
            c = 0;
            r = Math.min(rows.length - 1, r + 1);
          }
        }

        setAnchor({ r, c });
        setCurrent({ r, c });
        return;
      }

      // Arrow navigation
      if (!current || editingCell) return;
      let { r, c } = current;
      switch (e.key) {
        case "ArrowUp":
          r = Math.max(0, r - 1);
          break;
        case "ArrowDown":
          r = Math.min(rows.length - 1, r + 1);
          break;
        case "ArrowLeft":
          c = Math.max(0, c - 1);
          break;
        case "ArrowRight":
          c = Math.min(columns.length - 1, c + 1);
          break;
        default:
          return;
      }
      e.preventDefault();
      if (e.shiftKey) {
        setCurrent({ r, c });
      } else {
        setAnchor({ r, c });
        setCurrent({ r, c });
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!current) return;
      e.preventDefault();

      const clipboardText = e.clipboardData?.getData("text/plain");
      if (!clipboardText) return;

      // Use Zustand pasteData
      useTableStore.getState().pasteData(current.r, current.c, clipboardText);

      setEditingCell({ r: current.r, c: current.c });
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("paste", handlePaste, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("paste", handlePaste, { capture: true });
    };
  }, [anchor, current, rows, columns, editingCell, updateCell]);

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        if (source.data.type !== "row") return;

        const draggedIndex = (source.data as { rowIndex: number }).rowIndex;

        if (location.current.dropTargets.length === 1) {
          const targetIndex = (
            location.current.dropTargets[0].data as { rowIndex: number }
          ).rowIndex;

          if (draggedIndex === targetIndex) return;

          const destinationIndex = getDestinationIndex({
            startIndex: draggedIndex,
            targetIndex,
          });

          handleReorder({
            startIndex: draggedIndex,
            finishIndex: destinationIndex,
          });
        }
      },
    });
  }, [handleReorder]);

  return (
    <div className="relative">
      {rows.map((row, rowIndex) => (
        <ZustandCell
          key={rowIndex}
          rowData={row}
          rowIndex={rowIndex}
          // columns={columns}
        />
      ))}

      <button
        onClick={() =>
          useTableStore.setState((state) => {
            state.rows.push(Object.fromEntries(columns.map((h) => [h.id, ""])));
          })
        }
        className="flex items-center gap-2 cursor-pointer border-gray-100 py-1 px-2 text-[11px] text-gray-400 hover:bg-gray-50 w-full"
      >
        <PlusIcon className="w-3 h-3 text-gray-500" />
        <span className="select-none">Add Row</span>
      </button>
    </div>
  );
}
