import { Stack } from "../../ds/Stack.js";

export const NUM_PEGS = 3;
export const START_PEG = 0;
export const GOAL_PEG = 2;
export const SPARE_PEG = 1;
export const MIN_DISCS = 3;
export const MAX_DISCS = 8;
export const DEFAULT_DISCS = 5;

export const createInitialState = (n) => {
  // Job 1: make the towers - always NUM_PEGS, each its own new Stack
  const pegs = [];
  for (let i = 0; i < NUM_PEGS; i++) {
    pegs.push(new Stack());
  }

  // Job 2: make the discs - biggest first, so the smallest ends on top
  for (let disc = n; disc >= 1; disc--) {
    pegs[START_PEG].push(disc);
  }

  return {
    pegs,
    selected: null,
    moves: 0,
    status: "playing",
    discCount: n,
    solution: [], // auto-solve: the full move list from solve()
    solveIndex: 0, // auto-solve: which move to play next
    autoSolved: false, // true once Solve was pressed, for the win message
  };
};

export const canMove = (pegs, from, to) => {
  if (from === to) return false;
  const fromPeg = pegs[from];
  const toPeg = pegs[to];
  if (fromPeg.isEmpty()) return false;
  if (!toPeg.isEmpty() && fromPeg.peek() > toPeg.peek()) return false;

  return true;
};

export const moveDisc = (pegs, from, to) => {
  const check = canMove(pegs, from, to);
  const fromPeg = pegs[from];
  const toPeg = pegs[to];
  if (!check) return false;
  toPeg.push(fromPeg.pop());
  return true;
};

export const isWon = (state) => {
  const goalPeg = state.pegs[GOAL_PEG];
  return goalPeg.size === state.discCount;
};

// two-click move: 1st click picks a tower, 2nd click drops the disc there
export const clickPeg = (state, pegIndex) => {
  if (state.status !== "playing") return; // no moves after a win

  if (state.selected === null) {
    // pick up - only if there is a disc to pick up
    if (!state.pegs[pegIndex].isEmpty()) {
      state.selected = pegIndex;
    }
  } else if (state.selected === pegIndex) {
    // same tower again = put it back down
    state.selected = null;
  } else {
    // drop on another tower
    const moved = moveDisc(state.pegs, state.selected, pegIndex);
    if (moved) {
      state.moves++;
      if (isWon(state)) state.status = "won";
    }
    state.selected = null; // legal or not, the move attempt is over
  }
};

/**
 * - n: how many rings to move (the top n of the from tower)
 * - from: the tower they're on now
 * - to: the tower they need to end up on
 * - via: the third tower, used as a parking spot
 * - out: an array; each move is added to it as [from, to]
 */

export const solve = (n, from, to, via, out) => {
  if (n === 0) return; // nothing to move → "done"

  solve(n - 1, from, via, to, out); // 1. park n-1 rings on the spare tower
  out.push([from, to]); // 2. move ring n myself
  solve(n - 1, via, to, from, out); // 3. bring the n-1 rings back on top
};

// Step 10: same as solve(), but NO recursion - our own Stack replaces the call stack.
// Each item on the stack is a job:
//   { type: "solve", n, from, to, via }  = "move n rings" (a recursive call)
//   { type: "move", from, to }           = "move ring n myself" (out.push)
// solveJob() takes its arguments in the SAME order as solve(), so the two
// versions can be compared line by line.
const solveJob = (n, from, to, via) => ({ type: "solve", n, from, to, via });

export const solveIterative = (n, from, to, via, out) => {
  const jobs = new Stack();
  jobs.push(solveJob(n, from, to, via));

  while (!jobs.isEmpty()) {
    const job = jobs.pop();

    if (job.type === "move") {
      out.push([job.from, job.to]);
      continue;
    }

    if (job.n === 0) continue; // base case: nothing to move

    // solve() does 1, 2, 3 in that order. A stack pops the LAST push first,
    // so push them in REVERSE: 3, then 2, then 1 -> 1 comes out first.
    jobs.push(solveJob(job.n - 1, job.via, job.to, job.from)); // 3
    jobs.push({ type: "move", from: job.from, to: job.to }); // 2
    jobs.push(solveJob(job.n - 1, job.from, job.via, job.to)); // 1
  }
};

// auto-solve, part 1: build the WHOLE move list up front, then switch to "solving"
// (must start from a fresh board - solve() assumes every ring is on START_PEG)
export const startSolve = (state) => {
  solve(state.discCount, START_PEG, GOAL_PEG, SPARE_PEG, state.solution);
  state.solveIndex = 0;
  state.autoSolved = true;
  state.status = "solving";
};

// auto-solve, part 2: play ONE move from the list (called by the timer)
export const solveStep = (state) => {
  if (state.status !== "solving") return; // e.g. Reset was pressed mid-solve

  const [from, to] = state.solution[state.solveIndex];
  moveDisc(state.pegs, from, to);
  state.moves++;
  state.solveIndex++;

  if (state.solveIndex === state.solution.length) state.status = "won";
};
