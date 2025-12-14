import { useState } from "react";

export default function NoHighlightInput() {
  const [value, setValue] = useState("Can't highlight me");

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => setValue((e.target as HTMLDivElement).innerText)}
      className="border border-gray-300 px-4 py-2 rounded bg-red-200 outline-none select-none"
      style={{ userSelect: "none" }}
    >
      {value}
    </div>
  );
}
