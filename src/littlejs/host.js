// The ONE LittleJS engine for the whole app.
//
// LittleJS can only be started once per page (engineInit has no "stop" or
// "destroy"), and it listens to the keyboard/mouse on the WHOLE page. React,
// on the other hand, mounts and unmounts pages all the time. This file is the
// adapter between the two:
//   - start the engine the first time a game page opens, never again
//   - keep its canvas inside one <div> (root) that we move in and out of pages
//   - forward the engine's callbacks to whichever game "scene" is open now
//   - when no scene is open: pause it and stop it from blocking keys
import {
  engineInit,
  setPaused,
  setInputPreventDefault,
  setShowSplashScreen,
} from "littlejsengine/dist/littlejs.esm.min.js"; // release build (the default debug build draws a stats overlay)

// a scene = { size, enter(), update(), render(), renderPost() }
let current = null;
let started = false;

// the box the canvases live in; created once and reused by every mount
const root = document.createElement("div");
root.className = "littlejs-root";

export const mountScene = (container, scene) => {
  current = scene;

  // the canvas keeps the scene's shape (e.g. 1120x640) but shrinks on small screens
  root.style.aspectRatio = `${scene.size.x} / ${scene.size.y}`;
  root.style.maxWidth = `${scene.size.x}px`;
  container.appendChild(root);

  setPaused(false);
  setInputPreventDefault(true); // arrows/space go to the game, not the page

  if (!started) {
    started = true;
    setShowSplashScreen(false);
    engineInit(
      () => current?.enter(), // gameInit: runs once, after the engine is ready
      () => current?.update(),
      () => {}, // gameUpdatePost: not used
      () => current?.render(),
      () => current?.renderPost(),
      [], // no images
      root,
    );
  } else {
    scene.enter(); // engine already running: just set this scene up
  }

  // React calls this on unmount (leaving the page)
  return () => {
    if (current === scene) current = null;
    setPaused(true);
    setInputPreventDefault(false); // give Tab/Space/arrows back to the page
    root.remove();
  };
};
