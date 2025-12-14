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
