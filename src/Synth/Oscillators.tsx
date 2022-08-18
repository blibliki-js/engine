import { useState, useEffect } from "react";

import Engine from "Engine";
import Oscillator from "components/audio_modules/Oscillator";

export default function Oscillators() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds([
      Engine.registerModule("Osc 1", "osc1", "oscillator", { volume: -10 }),
      Engine.registerModule("Osc 2", "osc2", "oscillator", {}),
      Engine.registerModule("Osc 3", "osc3", "oscillator", {}),
    ]);
  }, [setIds]);

  return (
    <div>
      {ids.map((id) => (
        <Oscillator key={id} id={id} />
      ))}
    </div>
  );
}
