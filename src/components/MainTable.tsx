import { useState } from "react";
import TableHeader from "./sub/TableHeader";
import DataRows from "./sub/DataRows";

export default function TableContainer() {
  return (
    <div className="flex justify-center items-start min-h-screen p-6 relative mt-15">
      <div className="flex flex-col w-full max-w-4xl border border-gray-200 rounded relative">
        <DataRows />
      </div>
    </div>
  );
}
