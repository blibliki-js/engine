import { useEffect } from "react";

import Engine from "Engine";
import Note from "Engine/Note";

const MAP_KEYS: { [key: string]: Note } = {
  a: new Note("C3"),
  s: new Note("D3"),
  d: new Note("E3"),
  f: new Note("F3"),
  g: new Note("G3"),
  h: new Note("A3"),
  j: new Note("B3"),
  k: new Note("C4"),
  l: new Note("D4"),
  w: new Note("C#3"),
  e: new Note("D#3"),
  t: new Note("F#3"),
  y: new Note("G#3"),
  u: new Note("A#3"),
  o: new Note("C#4"),
  p: new Note("D#4"),
};

const onKeyTrigger = (type: string) => (event: KeyboardEvent) => {
  const note = MAP_KEYS[event.key];
  if (!note) return;

  Engine.triggerKey(note.fullName, type);
};

const onKeyDown = onKeyTrigger("noteOn");
const onKeyUp = onKeyTrigger("noteOff");

export default function ComputerMidiKeyboard() {
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return null;
}
