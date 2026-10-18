import { Link, Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "./Homepage";
import { Hanoi, Snake } from "./games";

function App() {
  const { pathname } = useLocation();

  return (
    <>
      {/* every page except the home page gets a way back */}
      {pathname !== "/" && (
        <Link to="/" className="back-link">
          ← All games
        </Link>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/hanoi" element={<Hanoi />} />
      </Routes>
    </>
  );
}

export default App;
