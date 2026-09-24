import { Route, Routes } from "react-router-dom";
import { HomePage } from "./Homepage";
import { Snake } from "./games";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snake" element={<Snake />} />
      </Routes>
    </>
  );
}

export default App;
