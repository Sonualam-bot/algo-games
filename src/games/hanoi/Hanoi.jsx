import { useEffect, useRef } from "react";
import { mountScene } from "../../littlejs/host.js";
import { hanoiScene } from "./hanoiScene.js";
import "./Hanoi.css";

// React only gives LittleJS a place on the page; the game itself is drawn
// on a canvas by hanoiScene.js
export const Hanoi = () => {
  const boxRef = useRef(null);

  // page opens -> put the canvas in the box; page closes -> take it out
  useEffect(() => mountScene(boxRef.current, hanoiScene), []);

  return (
    <main className="hanoi">
      <div ref={boxRef} className="hanoi-canvas-box" />
    </main>
  );
};
