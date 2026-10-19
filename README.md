# Algo Games

Learn data structures and algorithms by building and playing small games.
Every game is powered by one DSA idea.

## Games

| Game               | DSA idea           | How it's used                                                                                                                      |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Snake**          | Doubly linked list | The snake's body is a list. Each move adds a new head and removes the tail, both in O(1).                                          |
| **Tower of Hanoi** | Stack + recursion  | Each tower is a stack, so only the top ring can move. A recursive solver finds the best solution (2ⁿ − 1 moves) and plays it back. |

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

| Script            | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with hot reload |
| `npm run build`   | Build for production into `dist/`    |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Lint with Oxlint                     |

## How the code is organised

Every game is split into layers, so the DSA part stays plain JavaScript that
can be tested on its own with Node:

```
page (React)      Snake.jsx / Hanoi.jsx      when things happen, what's on screen
logic.js          plain JS, no React         the game rules
src/ds/           reusable data structures   DoublyLinkedList, Stack
```

```
src/
├── ds/
│   ├── DoublyLinkedList.js   sentinel head/tail, addFirst/removeLast in O(1)
│   └── Stack.js              push / pop / peek, iterable bottom → top
├── littlejs/
│   └── host.js               the one LittleJS engine for the whole app
├── games/
│   ├── snake/                React board + logic.js
│   └── hanoi/                LittleJS scene + logic.js
├── Homepage.jsx              game cards
└── App.jsx                   routes + the floating "All games" button
```

### LittleJS (Tower of Hanoi)

Tower of Hanoi is drawn on a canvas with [LittleJS](https://github.com/KilledByAPixel/LittleJS).
LittleJS can only start once per page and listens to the whole page's keyboard
and mouse, while React mounts and unmounts pages all the time.
`src/littlejs/host.js` connects the two:

- it starts the engine the first time a game page opens, and never again
- it moves the canvas into the page that is open, and out again when you leave
- it pauses the engine and gives keys like Tab and Space back to the page when no game is open
- it forwards the engine's callbacks to the open game's **scene** (`size`, `enter`, `update`, `render`, `renderPost`)

`hanoiScene.js` only handles input, timing and drawing. Every rule still comes
from `logic.js` and the `Stack` class.

## Tech

React 19 · Vite · React Router · LittleJS · Oxlint
