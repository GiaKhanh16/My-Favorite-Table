import ZustandHeader from "./ZustandHeader";
import { ZustandTableBody } from "./ZustandRow";
import ViewToggle from "./sub/Toggle";

export default function ZustandContainer() {
  return (
    <div className="flex flex-col items-start min-h-screen p-6 relative m-20">
      {/* Toggle aligned to the left */}
      <div className="w-full mb-4 flex justify-start">
        <ViewToggle />
      </div>

      {/* Table container */}
      <div className="flex flex-col border border-gray-200 rounded relative mt-5">
        <div className="flex border-b border-gray-200">
          <ZustandHeader />
        </div>
        <div className="flex">
          <ZustandTableBody />
        </div>
      </div>
    </div>
  );
}
