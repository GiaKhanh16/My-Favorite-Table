// App.tsx
// import CustomTable from "./components/TableCustom";
// import DragSelectTable from "./components/ExcelTable";
// import SingleRow from "./components/ExcelTable";
// import HighlightTable from "./components/HTMLTable";
import DragTable from "./components/Drag";
import TestTube from "./components/ExcelTable";
import TestTable from "./components/TestTable";

function App() {
  return (
    <div className="flex flex-col ">
      <DragTable />
      {/* <NoHighlightInput /> */}
    </div>
  );
}

export default App;
