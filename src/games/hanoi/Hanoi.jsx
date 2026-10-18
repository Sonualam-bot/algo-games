import { useEffect, useRef, useState } from "react";
import {
  clickPeg,
  createInitialState,
  DEFAULT_DISCS,
  GOAL_PEG,
  MAX_DISCS,
  MIN_DISCS,
  solveStep,
  startSolve,
} from "./logic.js";
import "./Hanoi.css";

// one colour per disc size (index = disc number - 1)
const DISC_COLORS = [
  "#e74c3c",
  "#e67e22",
  "#f1c40f",
  "#2ecc71",
  "#1abc9c",
  "#3498db",
  "#9b59b6",
  "#e84393",
];

const TOWER_LABELS = ["Start", "Spare", "Goal"];

// auto-solve delay per move, in ms (the speed slider's range)
const MIN_DELAY = 100;
const MAX_DELAY = 2000;
const DEFAULT_DELAY = 1500;

// every allowed disc count, for the picker: [3, 4, ..., 8]
const DISC_OPTIONS = [];
for (let n = MIN_DISCS; n <= MAX_DISCS; n++) {
  DISC_OPTIONS.push(n);
}

// plain copy of what the screen needs — React only ever reads this
const snapshot = (g) => ({
  pegs: g.pegs.map((peg) => [...peg]), // each Stack → array, bottom → top
  selected: g.selected,
  moves: g.moves,
  status: g.status,
  discCount: g.discCount,
  autoSolved: g.autoSolved,
});

export const Hanoi = () => {
  // create the game ONCE (lazy init), then keep it in a ref for mutation
  const [initialGame] = useState(() => createInitialState(DEFAULT_DISCS));
  const game = useRef(initialGame);

  // what gets drawn; setView(...) = new object = re-render
  const [view, setView] = useState(() => snapshot(initialGame));

  // auto-solve speed: a UI setting, not game state, so it lives outside the game
  const [delay, setDelay] = useState(DEFAULT_DELAY);

  const handleTowerClick = (pegIndex) => {
    clickPeg(game.current, pegIndex);
    setView(snapshot(game.current));
  };

  // picking a new disc count starts a new game
  const handleDiscCountChange = (e) => {
    game.current = createInitialState(Number(e.target.value));
    setView(snapshot(game.current));
  };

  // same disc count, fresh board
  const handleReset = () => {
    game.current = createInitialState(view.discCount);
    setView(snapshot(game.current));
  };

  // fresh board (9d), build the move list, start playing it
  const handleSolve = () => {
    game.current = createInitialState(view.discCount);
    startSolve(game.current);
    setView(snapshot(game.current));
  };

  // the auto-solve loop - same idea as the Snake game loop
  useEffect(() => {
    if (view.status !== "solving") return; // no loop unless solving

    const id = setInterval(() => {
      solveStep(game.current); // play one move on the real game
      setView(snapshot(game.current)); // hand React a fresh copy to draw
    }, delay);

    return () => clearInterval(id); // cleanup: stop this timer
  }, [view.status, delay]); // new delay = old timer cleared, new one started

  const solving = view.status === "solving";

  const best = 2 ** view.discCount - 1; // calculated, not stored (Step 2)

  const towerClass = (pegIndex) => {
    let cls = "tower";
    if (pegIndex === GOAL_PEG) cls += " goal";
    if (view.selected === pegIndex) cls += " selected";
    return cls;
  };

  return (
    <main className="hanoi">
      <h1>Tower of Hanoi</h1>
      <p className="hanoi-rules">
        Move all rings to the <strong>Goal</strong> tower. Only the top ring
        moves, and never onto a smaller one.
      </p>

      <div className="hanoi-controls">
        <label>
          Discs:{" "}
          <select
            value={view.discCount}
            onChange={handleDiscCountChange}
            disabled={solving}
          >
            {DISC_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button className="hanoi-btn" onClick={handleReset}>
          Reset
        </button>
        <button
          className="hanoi-btn primary"
          onClick={handleSolve}
          disabled={solving}
        >
          Solve
        </button>
        <label className="hanoi-speed">
          Fast
          <input
            type="range"
            min={MIN_DELAY}
            max={MAX_DELAY}
            step={100}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
          />
          Slow
        </label>
        <span className="hanoi-moves">
          Moves: {view.moves} / best {best}
        </span>
      </div>

      <div className="hanoi-board">
        {view.pegs.map((peg, pegIndex) => (
          <div
            key={pegIndex}
            className="tower-column"
            onClick={() => handleTowerClick(pegIndex)}
          >
            <div className={towerClass(pegIndex)}>
              {peg.map((disc) => (
                <div
                  key={disc}
                  className="disc"
                  style={{
                    width: `${20 + disc * 10}%`, // disc 8 = 100% of the tower
                    backgroundColor: DISC_COLORS[disc - 1],
                  }}
                />
              ))}
            </div>
            <span className="tower-label">{TOWER_LABELS[pegIndex]}</span>
          </div>
        ))}
      </div>

      {/* keeps its height when empty, so the board doesn't jump on a win */}
      <p className="hanoi-status">
        {solving && "Solving..."}
        {view.status === "won" &&
          view.autoSolved &&
          `Solved automatically in ${view.moves} moves.`}
        {view.status === "won" &&
          !view.autoSolved &&
          (view.moves === best
            ? `🎉 You won in ${view.moves} moves. Perfect!`
            : `🎉 You won in ${view.moves} moves. Best possible is ${best}.`)}
      </p>
    </main>
  );
};
