import { useEffect, useState } from "react";
import { Transport } from "tone";

import Oscillator from "./components/audio_modules/Oscillator";
import Envelope from "./components/audio_modules/Envelope";

export default function Synth() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    Transport.start();
  }, [enabled]);

  return (
    <>
      {!enabled && <button onClick={() => setEnabled(true)}>Start</button>}
      {enabled && <Oscillator title="Osc 1" />}
      {enabled && <Oscillator title="Osc 2" />}
      {enabled && <Oscillator title="Osc 3" />}
      {enabled && <Envelope title="Amp Envelope" amp={true} />}
    </>
  );
}
