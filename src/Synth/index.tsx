import { useEffect, useState } from "react";
import { Transport } from "tone";

import MidiDeviceSelector from "./components/MidiDeviceSelector";
import Envelope from "./components/audio_modules/Envelope";

import Oscillators from "./Oscillators";
import Mixer from "./Mixer";

export default function Synth() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    Transport.start();
  }, [enabled]);

  return (
    <>
      {!enabled && <button onClick={() => setEnabled(true)}>Start</button>}
      <MidiDeviceSelector />
      {enabled && <Oscillators />}
      {enabled && <Mixer />}
      {enabled && <Envelope title="Amp Envelope" amp={true} />}
    </>
  );
}
