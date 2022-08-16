import { useEffect, useState } from "react";
import { Transport, Context, setContext } from "tone";
import styled from "@emotion/styled";

import Engine from "Engine";

import MidiDeviceSelector from "components/MidiDeviceSelector";

import Oscillators from "./Oscillators";
import Mixer from "./Mixer";
import EnvelopesAndFilter from "./EnvelopesAndFilter";

const SynthContainer = styled.div`
  display: grid;
  grid-template-areas:
    "midi midi midi"
    "oscillators mixer envelopes";
  gap: 10px;
  padding: 10px;
`;

interface IRow {
  area: string;
}

const Row = styled.div<IRow>`
  grid-area: ${(props) => props.area};
`;

export default function Synth() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const context = new Context({ latencyHint: "interactive" });
    setContext(context);
    Transport.start();

    return () => Engine.dispose();
  }, [enabled]);

  if (!enabled) return <button onClick={() => setEnabled(true)}>Start</button>;

  return (
    <SynthContainer>
      <Row area="midi">
        <MidiDeviceSelector />
      </Row>

      <Row area="oscillators">
        <Oscillators />
      </Row>
      <Row area="mixer">
        <Mixer />
      </Row>
      <Row area="envelopes">
        <EnvelopesAndFilter />
      </Row>
    </SynthContainer>
  );
}
