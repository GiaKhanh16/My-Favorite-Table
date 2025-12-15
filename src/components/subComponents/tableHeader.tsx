import type { TableHeaderProps } from "../utils/types";

export default function TableHeader({ headers, setHeaders }: TableHeaderProps) {
  return (
    <>
      {headers.map((item, index) => (
        <label
          key={index}
          className={`flex items-center gap-2 flex-1 text-left text-[11px] py-2 px-2 text-gray-400 hover:bg-gray-50 ${
            index < headers.length - 1 ? "border-r border-gray-100" : ""
          }`}
          style={{ fontWeight: 500 }}
        >
          <input
            className="bg-transparent outline-none w-full selection:bg-gray-300 selection:text-white text-[11px]"
            value={item.label}
            onChange={(e) => {
              const newHeader = [...headers];
              newHeader[index] = {
                ...newHeader[index],
                label: e.target.value,
              };
              setHeaders(newHeader);
            }}
          />
        </label>
      ))}
    </>
  );
}
