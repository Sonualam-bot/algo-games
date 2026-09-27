import { DoublyLinkedList } from "../../ds/DoublyLinkedList.js";

export const GRID_SIZE = 10;
export const INITIAL_SPEED = 500; // ms per tick

export const DIRECTIONS = {
  up: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
};

const OPPOSITE = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const randomDirection = () => {
  const values = Object.keys(DIRECTIONS);
  const direction = values[Math.floor(Math.random() * values.length)];
  return direction;
};

export const turn = (state, dir) => {
  if (OPPOSITE[dir] === state.lastMoved) return; // would reverse into the neck
  state.direction = dir;
};

const createSnake = (direction) => {
  const snake = new DoublyLinkedList();

  // 1. choose the head position (decide: center, or random within a margin)
  const center = Math.floor(GRID_SIZE / 2);
  const head = { x: center, y: center };

  // 2. look up the vector for this direction
  const vec = DIRECTIONS[direction];

  // 3. tail is one step BEHIND the head → subtract the vector
  const tail = { x: head.x - vec.x, y: head.y - vec.y };

  snake.addFirst(head);
  snake.addLast(tail);

  return snake;
};

export const randomFood = (snake) => {
  // 5.1 snake cells → Set of "x,y" strings (for O(1) lookups)
  const occupied = new Set();
  for (const cell of snake) {
    // ← your generator runs here
    occupied.add(`${cell.x},${cell.y}`);
  }

  // 5.2 every cell NOT in the set is free
  const free = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }

  // 5.4 board full → player won
  if (free.length === 0) {
    return null;
  }

  // 5.3 random free cell
  return free[Math.floor(Math.random() * free.length)];
};

export const createInitialState = () => {
  const direction = randomDirection();
  const snake = createSnake(direction);
  return {
    snake: snake,
    direction,
    lastMoved: direction,
    food: randomFood(snake),
    score: 0,
    speed: INITIAL_SPEED,
    status: "ready",
  };
};

export const move = (snake, direction, food) => {
  const head = snake.getFirst();
  const vec = DIRECTIONS[direction];
  const newHead = { x: head.x + vec.x, y: head.y + vec.y };
  snake.addFirst(newHead);

  const ate = newHead.x === food.x && newHead.y === food.y;
  if (!ate) {
    snake.removeLast();
  }
  return ate;
};

export const step = (state) => {
  const ate = move(state.snake, state.direction, state.food);
  state.lastMoved = state.direction;
  const head = state.snake.getFirst();

  // wall: head left the 0..GRID_SIZE-1 box on either axis
  const hitWall =
    head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;

  // self: head sits on any body cell (skip the first cell, it IS the head)
  let hitSelf = false;
  let isHead = true;
  for (const cell of state.snake) {
    if (isHead) {
      isHead = false;
      continue;
    }
    if (cell.x === head.x && cell.y === head.y) {
      hitSelf = true;
      break;
    }
  }

  if (hitWall || hitSelf) {
    state.status = "over";
    return;
  }

  if (ate) {
    state.score += 1;
    state.food = randomFood(state.snake);
    if (state.food === null) {
      state.status = "won";
    }
  }
};
