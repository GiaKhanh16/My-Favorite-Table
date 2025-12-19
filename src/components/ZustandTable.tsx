import ZustandHeader from "./ZustandHeader";
import { ZustandRow } from "./ZustandRow";
import ViewToggle from "./sub/Toggle";

export default function ZustandContainer() {
  return (
    <div className="flex flex-col items-center min-h-screen p-6 relative mt-15">
      {/* Toggle aligned to the left */}
      <div
        style={{
          width: "100%",
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "center", // start centered
          transform: "translateX(-315px)", // <-- brute force move left
        }}
      >
        <ViewToggle />
      </div>

      {/* Table container */}
      <div className="flex flex-col border border-gray-200 rounded relative mt-5">
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
