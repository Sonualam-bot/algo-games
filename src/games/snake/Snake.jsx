import { useEffect, useRef, useState } from "react";
import { createInitialState, GRID_SIZE, step, turn } from "./logic";
import "./Snake.css";

// plain copy of what the screen needs — React only ever reads this
const snapshot = (g) => ({
  cells: [...g.snake], // generator → array, head first
  food: g.food,
  status: g.status,
  score: g.score,
  speed: g.speed,
});

export const Snake = () => {
  // create the game ONCE (lazy init), then keep it in a ref for mutation
  const [initialGame] = useState(createInitialState);
  const game = useRef(initialGame);

  // what gets drawn; setView(...) = new object = re-render
  const [view, setView] = useState(() => snapshot(initialGame));

  // head cell, so it can get its own color
  const head = view.cells[0];

  // every snake cell as "x,y" for O(1) lookups (same idea as randomFood)
  const occupied = new Set();
  for (const cell of view.cells) {
    occupied.add(`${cell.x},${cell.y}`);
  }

  const cells = [];
  for (let y = GRID_SIZE - 1; y >= 0; y--) {
    for (let x = 0; x <= GRID_SIZE - 1; x++) {
      let cls = "cell";
      if (x === head.x && y === head.y) {
        cls += " head";
      } else if (occupied.has(`${x},${y}`)) {
        cls += " body";
      } else if (view.food && x === view.food.x && y === view.food.y) {
        cls += " food";
      }
      cells.push(<div key={`${x},${y}`} className={cls} />);
    }
  }

  const startGame = () => {
    const currentStatus = game.current.status;
    if (currentStatus === "won" || currentStatus === "over") {
      game.current = createInitialState();
    }
    game.current.status = "playing";
    setView(snapshot(game.current));
  };

  const endGame = () => {
    game.current.status === "over";
    setView(snapshot(game.current));
  };

  useEffect(() => {
    if (view.status !== "playing") return; // no loop unless playing

    const id = setInterval(() => {
      step(game.current); // mutate the real game (O(1) list ops)
      setView(snapshot(game.current)); // hand React a fresh copy to draw
    }, view.speed);

    return () => clearInterval(id); // cleanup: stop this timer
  }, [view.status, view.speed]);

  return (
    <div className="main-container">
      <div className="board" style={{ "--grid-size": GRID_SIZE }}>
        {cells}
      </div>

      <aside>
        <section>
          <button onClick={() => startGame()} className="start-btn">
            Start
          </button>
          <button onClick={() => endGame()} className="start-btn end-btn">
            End
          </button>
        </section>
        <section className="direction-container">
          <button className="up" onClick={() => turn(game.current, "up")}>
            ↑
          </button>
          <button className="down" onClick={() => turn(game.current, "down")}>
            ↓
          </button>
          <button className="left" onClick={() => turn(game.current, "left")}>
            ←
          </button>
          <button className="right" onClick={() => turn(game.current, "right")}>
            →
          </button>
        </section>
      </aside>
    </div>
  );
};
