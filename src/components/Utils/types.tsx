export type TableHeaderProps = {
  headers: Header[];
  setHeaders: React.Dispatch<React.SetStateAction<Header[]>>;
};

export type Header = {
  label: string;
};

// types.ts
export type Row = [
  name: string,
  birthday: string,
  location: string,
  phone: string,
  handle: string
];
export type Rows = Row[];

export type TableMainProps = {
  rows: Rows;
};

export type TableHeaderType = {
  label: string;
};

export type DataRowProps = {
  rowData: string[];
  rowIndex: number;
  onDelete: (rowIndex: number) => void;
  headers: { label: string }[];
  updateCell: (rowIndex: number, colIndex: number, value: string) => void;
  isCellSelected: (r: number, c: number) => boolean;
  editingCell: { r: number; c: number } | null;
  setEditingCell: React.Dispatch<
    React.SetStateAction<{ r: number; c: number } | null>
  >;
  setAnchor: React.Dispatch<
    React.SetStateAction<{ r: number; c: number } | null>
  >;
  setCurrent: React.Dispatch<
    React.SetStateAction<{ r: number; c: number } | null>
  >;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
};
