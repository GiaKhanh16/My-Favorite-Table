import ZustandHeader from "./ZustandHeader";
import { ZustandRow } from "./ZustandRow";

export default function ZustandContainer() {
  return (
    <div className="flex justify-center items-start min-h-screen p-6 relative mt-15">
      <div className="flex flex-col border border-gray-200 rounded relative ">
        <div className="flex border-b border-gray-200">
          <ZustandHeader />
        </div>
        <div className="flex">
          <ZustandRow />
        </div>
      </div>
    </div>
  );
}
