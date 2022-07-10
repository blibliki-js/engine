import { useEffect, useState } from "react";
import { Transport, Context, setContext } from "tone";

import MidiDeviceSelector from "components/MidiDeviceSelector";

import Oscillators from "./Oscillators";
import Mixer from "./Mixer";
import EnvelopesAndFilter from "./EnvelopesAndFilter";

export default function Synth() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const context = new Context({ latencyHint: "interactive" });
    setContext(context);
    Transport.start();
  }, [enabled]);

  return (
    <>
      {!enabled && <button onClick={() => setEnabled(true)}>Start</button>}
      <MidiDeviceSelector />
      {enabled && <Oscillators />}
      {enabled && <Mixer />}
      {enabled && <EnvelopesAndFilter />}
    </>
  );
}
