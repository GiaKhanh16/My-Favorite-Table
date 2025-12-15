// App.tsx
// import CustomTable from "./components/TableCustom";
// import DragSelectTable from "./components/ExcelTable";
// import SingleRow from "./components/ExcelTable";
// import HighlightTable from "./components/HTMLTable";
// import TestTubeTube from "./components/compbreak";
import DragTable from "./components/Drag";
import TestTube from "./components/ExcelTable";
import TableContainer from "./components/MainTable";
import TestTable from "./components/TestTable";

function App() {
  return (
    <div className="flex flex-col ">
      <TableContainer />
      {/* <NoHighlightInput /> */}
    </div>
  );
}

export default App;
