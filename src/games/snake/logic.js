export const GRID_SIZE = 20;

export const DIRECTIONS = {
  up: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
};

export const randomDirection = () => {
  const values = Object.keys(DIRECTIONS);
  const direction = values[Math.floor(Math.random() * values.length)];
  return direction;
};

export const INITIAL_SPEED = 150; // ms per tick

const createSnake = (direction) => {
  // 1. choose the head position (decide: center, or random within a margin)
  const center = Math.floor(GRID_SIZE / 2);
  const head = { x: center, y: center };

  // 2. look up the vector for this direction
  const vec = DIRECTIONS[direction];

  // 3. tail is one step BEHIND the head → subtract the vector
  const tail = { x: head.x - vec.x, y: head.y - vec.y };

  return [head, tail]; // index 0 = head
};

export const createInitialState = () => {
  const direction = randomDirection();
  return {
    snake: createSnake(direction),
    direction,
    food: { x: 0, y: 0 },
    score: 0,
    speed: INITIAL_SPEED,
    status: "ready",
  };
};
