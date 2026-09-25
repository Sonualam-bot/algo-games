import { DoublyLinkedList } from "../../ds/DoublyLinkedList.js";

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150; // ms per tick

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
    state.food = { x: 0, y: 0 };
  }
};
