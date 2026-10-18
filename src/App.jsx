import { Route, Routes } from "react-router-dom";
import { HomePage } from "./Homepage";
import { Hanoi, Snake } from "./games";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/hanoi" element={<Hanoi />} />
      </Routes>
    </>
  );
}

export default App;
