// Tower of Hanoi drawn with LittleJS. All the RULES still come from logic.js
// (your Stacks, clickPeg, solve...). This file only does what Hanoi.jsx used
// to do: read input, run the auto-solve timer, and draw.
import {
  setCanvasFixedSize,
  setCanvasClearColor,
  setCameraPos,
  setCameraScale,
  vec2,
  rgb,
  Color,
  drawRect,
  drawCircle,
  drawTextScreen,
  keyWasPressed,
  mouseWasPressed,
  mousePos,
  mousePosScreen,
  mainCanvasSize,
  timeDelta,
} from "littlejsengine/dist/littlejs.esm.min.js";
import {
  createInitialState,
  clickPeg,
  startSolve,
  solveStep,
  NUM_PEGS,
  GOAL_PEG,
  MIN_DISCS,
  MAX_DISCS,
  DEFAULT_DISCS,
} from "./logic.js";

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
].map((hex) => new Color().setHex(hex));
const TOWER_LABELS = ["Start", "Spare", "Goal"];

// ---------- layout (world units; 1 unit = SCALE pixels) ----------
const SIZE = vec2(1120, 640); // canvas size in pixels
const SCALE = 40;
const TOWER_X = [-9, 0, 9];
const RING_H = 0.8; // ring thickness
const RING_GAP = 0.06;
const POLE_H = MAX_DISCS * (RING_H + RING_GAP) + 1.2;
const LIFT_Y = POLE_H + 1.2; // height a ring travels at between towers

// auto-solve: seconds per move, slowest -> fastest (the old speed slider)
const SPEEDS = [1.5, 1, 0.6, 0.35, 0.2, 0.1];
const DEFAULT_SPEED = 2;

// ---------- scene state ----------
let game = createInitialState(DEFAULT_DISCS); // the real game: your Stacks
let shown = new Map(); // disc -> where it is DRAWN now (animates toward its real spot)
let solveTimer = 0;
let speed = DEFAULT_SPEED; // index into SPEEDS
let buttons = []; // screen-space buttons, rebuilt every frame in renderPost

const ringWidth = (disc) => 1.4 + disc * 0.85;

// rings must finish flying before the next auto-solve move starts
const ringSpeed = () => Math.max(45, 40 / SPEEDS[speed]);

// where a disc SHOULD be, read from the real game state (your Stacks)
const targetOf = (disc) => {
  for (let p = 0; p < NUM_PEGS; p++) {
    const stack = [...game.pegs[p]]; // bottom -> top, your iterator
    const k = stack.indexOf(disc);
    if (k === -1) continue;
    const isLifted = game.selected === p && k === stack.length - 1;
    const y = isLifted ? LIFT_Y : RING_H / 2 + k * (RING_H + RING_GAP);
    return vec2(TOWER_X[p], y);
  }
};

const newGame = (n) => {
  game = createInitialState(n);
  shown = new Map();
  for (let d = 1; d <= n; d++) shown.set(d, targetOf(d));
  solveTimer = 0;
};

// fresh board, then solve (same as the old handleSolve)
const solveNow = () => {
  newGame(game.discCount);
  startSolve(game);
};

// move a point toward its target: straight up, across at LIFT_Y, straight down
const fly = (pos, target, dist) => {
  let aim = target;
  if (Math.abs(pos.x - target.x) > 0.01) {
    aim = pos.y < LIFT_Y - 0.01 ? vec2(pos.x, LIFT_Y) : vec2(target.x, LIFT_Y);
  }
  const d = aim.subtract(pos);
  const len = d.length();
  if (len <= dist) {
    const left = dist - len;
    return aim === target || left <= 0 ? aim : fly(aim, target, left);
  }
  return pos.add(d.scale(dist / len));
};

// a rounded ring = rectangle + a circle on each end, plus a highlight and a shadow
const drawRing = (pos, width, color) => {
  const r = RING_H / 2;
  const bar = width - RING_H;
  drawRect(pos, vec2(bar, RING_H), color);
  drawCircle(pos.add(vec2(-bar / 2, 0)), RING_H, color);
  drawCircle(pos.add(vec2(bar / 2, 0)), RING_H, color);
  drawRect(
    pos.add(vec2(0, r * 0.45)),
    vec2(bar, RING_H * 0.18),
    rgb(1, 1, 1, 0.3),
  );
  drawRect(
    pos.add(vec2(0, -r * 0.6)),
    vec2(bar, RING_H * 0.15),
    rgb(0, 0, 0, 0.18),
  );
};

const isOver = (b) =>
  Math.abs(mousePosScreen.x - b.pos.x) < b.size.x / 2 &&
  Math.abs(mousePosScreen.y - b.pos.y) < b.size.y / 2;

// ---------- the scene (host.js calls these) ----------
export const hanoiScene = {
  size: SIZE,

  // every time the page opens: canvas + camera setup, fresh game
  enter() {
    setCanvasFixedSize(SIZE);
    setCanvasClearColor(rgb(0.063, 0.082, 0.11));
    setCameraScale(SCALE);
    setCameraPos(vec2(0, 5.2));
    speed = DEFAULT_SPEED;
    newGame(DEFAULT_DISCS);
  },

  update() {
    const solving = game.status === "solving";

    // buttons first, so a button click never also hits a tower
    let clickUsed = false;
    if (mouseWasPressed(0)) {
      for (const b of buttons) {
        if (b.onClick && !b.disabled && isOver(b)) {
          b.onClick();
          clickUsed = true;
        }
      }
    }

    // towers: mouse click -> your clickPeg()
    if (!solving) {
      if (
        mouseWasPressed(0) &&
        !clickUsed &&
        mousePos.y > -1.5 &&
        mousePos.y < LIFT_Y + 1
      ) {
        let nearest = 0;
        for (let p = 1; p < NUM_PEGS; p++) {
          if (
            Math.abs(mousePos.x - TOWER_X[p]) <
            Math.abs(mousePos.x - TOWER_X[nearest])
          )
            nearest = p;
        }
        if (Math.abs(mousePos.x - TOWER_X[nearest]) < 4.5)
          clickPeg(game, nearest);
      }
      if (keyWasPressed("KeyS")) solveNow();
    }
    if (keyWasPressed("KeyR")) newGame(game.discCount);

    // auto-solve: one solveStep() every SPEEDS[speed] seconds (the old useEffect timer)
    if (game.status === "solving") {
      solveTimer += timeDelta;
      if (solveTimer >= SPEEDS[speed]) {
        solveTimer = 0;
        solveStep(game);
      }
    }

    // animate every ring toward where your Stacks say it is
    for (const [disc, pos] of shown) {
      shown.set(disc, fly(pos, targetOf(disc), ringSpeed() * timeDelta));
    }
  },

  render() {
    // towers: pole + base; the goal base is green
    TOWER_X.forEach((x, p) => {
      const baseColor =
        p === GOAL_PEG ? rgb(0.18, 0.55, 0.34) : rgb(0.55, 0.35, 0.17);
      drawRect(vec2(x, POLE_H / 2), vec2(0.4, POLE_H), rgb(0.63, 0.32, 0.18));
      drawCircle(vec2(x, POLE_H), 0.4, rgb(0.63, 0.32, 0.18));
      drawRect(vec2(x, -0.3), vec2(8.6, 0.6), baseColor);
    });

    // biggest first, so a flying small ring is drawn on top
    [...shown.keys()]
      .sort((a, b) => b - a)
      .forEach((disc) =>
        drawRing(shown.get(disc), ringWidth(disc), DISC_COLORS[disc - 1]),
      );
  },

  // text + buttons, in screen pixels (drawn on top of everything)
  renderPost() {
    const cx = mainCanvasSize.x / 2;
    const h = mainCanvasSize.y;
    const solving = game.status === "solving";
    const best = 2 ** game.discCount - 1; // calculated, not stored

    drawTextScreen("TOWER OF HANOI", vec2(cx, 34), 32, rgb(0.6, 0.95, 0.65));

    TOWER_X.forEach((x, p) => {
      drawTextScreen(
        TOWER_LABELS[p],
        vec2(cx + x * SCALE, h - 52),
        20,
        rgb(0.75, 0.78, 0.82),
      );
    });

    // rebuilt each frame so update() can hit-test them
    const row = 82;
    buttons = [
      {
        label: "-",
        pos: vec2(cx - 440, row),
        size: vec2(40, 36),
        disabled: solving || game.discCount <= MIN_DISCS,
        onClick: () => newGame(game.discCount - 1),
      },
      {
        label: `${game.discCount} rings`,
        pos: vec2(cx - 370, row),
        size: vec2(90, 36),
      },
      {
        label: "+",
        pos: vec2(cx - 300, row),
        size: vec2(40, 36),
        disabled: solving || game.discCount >= MAX_DISCS,
        onClick: () => newGame(game.discCount + 1),
      },
      {
        label: "Reset",
        pos: vec2(cx - 195, row),
        size: vec2(100, 36),
        onClick: () => newGame(game.discCount),
      },
      {
        label: "Solve",
        pos: vec2(cx - 85, row),
        size: vec2(100, 36),
        disabled: solving,
        primary: true,
        onClick: solveNow,
      },
      {
        label: "-",
        pos: vec2(cx + 25, row),
        size: vec2(40, 36),
        disabled: speed === 0,
        onClick: () => speed--,
      },
      {
        label: `Speed ${speed + 1}`,
        pos: vec2(cx + 95, row),
        size: vec2(90, 36),
      },
      {
        label: "+",
        pos: vec2(cx + 165, row),
        size: vec2(40, 36),
        disabled: speed === SPEEDS.length - 1,
        onClick: () => speed++,
      },
    ];
    for (const b of buttons) {
      if (b.onClick) {
        const fill = b.primary ? rgb(0.18, 0.55, 0.34) : rgb(0.2, 0.25, 0.31);
        const hover = !b.disabled && isOver(b);
        drawRect(
          b.pos,
          b.size,
          b.disabled ? fill.scale(0.6, 1) : hover ? fill.scale(1.25, 1) : fill,
          0,
          undefined,
          true,
        );
      }
      const faded = b.disabled && b.onClick;
      drawTextScreen(
        b.label,
        b.pos.add(vec2(0, 1)),
        18,
        faded ? rgb(1, 1, 1, 0.4) : rgb(1, 1, 1),
      );
    }
    drawTextScreen(
      `Moves: ${game.moves} / best ${best}`,
      vec2(cx + 340, row),
      20,
      rgb(0.85, 0.88, 0.92),
    );

    // status line
    let message = "Click a tower to pick up its top ring";
    if (game.selected !== null) message = "Now click where to drop it";
    if (solving) message = "Solving...";
    if (game.status === "won") {
      message = game.autoSolved
        ? `Solved automatically in ${game.moves} moves.`
        : game.moves === best
          ? `🎉 You won in ${game.moves} moves. Perfect!`
          : `🎉 You won in ${game.moves} moves. Best possible is ${best}.`;
    }
    const color =
      game.status === "won" ? rgb(1, 0.85, 0.3) : rgb(0.6, 0.65, 0.7);
    drawTextScreen(message, vec2(cx, h - 18), 20, color);
  },
};
