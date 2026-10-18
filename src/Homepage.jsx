import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <main>
      <Link to="/snake">Snake</Link>
      <Link to="/hanoi">Hanoi</Link>
    </main>
  );
};
