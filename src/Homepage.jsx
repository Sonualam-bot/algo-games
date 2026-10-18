import { Link } from "react-router-dom";
import "./Homepage.css";

// every game on the home page; add one entry here when a new game is built
const GAMES = [
  {
    name: "Snake",
    path: "/snake",
    topic: "Doubly linked list",
    description: "Add a new head, drop the tail. Every move is O(1).",
    preview: "snake",
  },
  {
    name: "Tower of Hanoi",
    path: "/hanoi",
    topic: "Stack + recursion",
    description: "Each tower is a stack. Watch recursion solve it for you.",
    preview: "hanoi",
  },
];

// small CSS-only picture of each game, drawn with plain divs
const Preview = ({ type }) => {
  if (type === "snake") {
    return (
      <div className="preview preview-snake">
        <span className="seg head" />
        <span className="seg" />
        <span className="seg" />
        <span className="seg" />
        <span className="food" />
      </div>
    );
  }
  if (type === "hanoi") {
    return (
      <div className="preview preview-hanoi">
        <span className="ring r1" />
        <span className="ring r2" />
        <span className="ring r3" />
      </div>
    );
  }
  return <div className="preview" />;
};

const GameCard = ({ game }) => (
  <Link to={game.path} className="game-card">
    <Preview type={game.preview} />
    <div className="card-body">
      <span className="card-topic">{game.topic}</span>
      <h2>{game.name}</h2>
      <p>{game.description}</p>
      <span className="card-cta">Play →</span>
    </div>
  </Link>
);

export const HomePage = () => {
  return (
    <main className="home">
      <header className="home-header">
        <h1>Algo Games</h1>
        <p>
          Learn data structures and algorithms by building and playing small
          games. Every game is powered by one DSA idea.
        </p>
      </header>

      <section className="game-grid">
        {GAMES.map((game) => (
          <GameCard key={game.name} game={game} />
        ))}
      </section>
    </main>
  );
};
