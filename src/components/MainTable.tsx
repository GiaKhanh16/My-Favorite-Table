import { useState } from "react";
import TableHeader from "./subComponents/TableHeader";
import DataRows from "./subComponents/DataRows";

export default function TableContainer() {
  const [headers, setHeaders] = useState([
    { label: "Name" },
    { label: "Birthday" },
    { label: "Location" },
    { label: "Contact" },
    { label: "Social" },
  ]);

  return (
    <div className="flex justify-center items-start min-h-screen p-6 relative mt-15">
      <div className="flex flex-col w-full max-w-4xl border border-gray-200 rounded relative">
        <div className="flex border-b border-gray-200">
          <TableHeader headers={headers} setHeaders={setHeaders} />
        </div>
        <DataRows headers={headers} />
      </div>
    </div>
  );
}
