import {
  UserIcon,
  CakeIcon,
  MapIcon,
  PhoneIcon,
  GlobeAltIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";

function CustomTable() {
  const initialHeaders = [
    {
      label: "Name",
      icon: <UserIcon className="w-3 h-3 text-gray-500 inline mr-1" />,
    },
    {
      label: "Birthday",
      icon: <CakeIcon className="w-3 h-3 text-gray-500 inline mr-1" />,
    },
    {
      label: "Location",
      icon: <MapIcon className="w-3 h-3 text-gray-500 inline mr-1" />,
    },
    {
      label: "Contact",
      icon: <PhoneIcon className="w-3 h-3 text-gray-500 inline mr-1" />,
    },
    {
      label: "Social",
      icon: <GlobeAltIcon className="w-3 h-3 text-gray-500 inline mr-1" />,
    },
  ];

  const [headers, setHeaders] = useState(initialHeaders);
  const [rows, setRows] = useState<string[][]>([]);

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill("")]);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-6">
      <div className="flex flex-col w-full max-w-4xl border border-gray-200 rounded">
        <div className="flex border-b border-gray-200">
          {headers.map((header, index) => (
            <label
              key={index}
              className={`flex items-center gap-2 flex-1 text-left text-[11px] py-2 px-2 text-gray-400 hover:bg-gray-50 ${
                index < headers.length - 1 ? "border-r border-gray-100" : ""
              }`}
              style={{ fontWeight: 500 }}
            >
              {header.icon}
              <input
                type="text"
                value={header.label}
                onChange={(e) => {
                  const newHeaders = [...headers];
                  newHeaders[index].label = e.target.value;
                  setHeaders(newHeaders);
                }}
                className="bg-transparent outline-none w-full selection:bg-gray-300 selection:text-white text-[11px] "
              />
            </label>
          ))}
        </div>

        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex border-b border-gray-100">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className="flex-1 py-2 px-2 text-[11px] border-r border-gray-100 last:border-none"
              >
                <input
                  type="text"
                  value={cell}
                  onChange={(e) =>
                    updateCell(rowIndex, colIndex, e.target.value)
                  }
                  className="bg-transparent outline-none w-full selection:bg-gray-300 selection:text-white text-gray-500 text-[11px]"
                />
              </div>
            ))}
          </div>
        ))}

        <div
          onClick={addRow}
          className="flex items-center gap-2 cursor-pointer  border-gray-100 py-1 px-2 text-[11px] text-gray-400 hover:bg-gray-50 "
        >
          <PlusIcon className="w-3 h-3 text-gray-500" />
          <span>Add Row</span>
        </div>
      </div>
    </div>
  );
}

export default CustomTable;
