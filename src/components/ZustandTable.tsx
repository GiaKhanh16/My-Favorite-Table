// import { PlusIcon } from "@heroicons/react/24/solid";
// import { useTableStore } from "../store/TableStore";
// import { ZustandRow } from "./ZustandRow";

// export function ZustandTable() {
//   const rows = useTableStore((state) => state.rows);
//   const addRow = useTableStore((state) => state.addRow);

//   return (
//     <div className="px-10 py-10 flex justify-center items-start min-h-screen bg-gray-100">
//       <div className="flex flex-col w-full max-w-4xl border border-gray-300 rounded ">
//         <div>
//           {rows.map((_, rowIndex) => (
//             <ZustandRow key={rowIndex} rowIndex={rowIndex} />
//           ))}
//         </div>

//         <div
//           onClick={addRow}
//           className="flex items-center gap-2 cursor-pointer py-1 px-2 text-[11px] text-gray-400 hover:bg-white"
//         >
//           <PlusIcon className="w-3 h-3 text-gray-500" />
//           <span>Add Row</span>
//         </div>
//       </div>
//     </div>
//   );
// }
