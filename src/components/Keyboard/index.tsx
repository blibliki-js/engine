import { useState } from "react";
import styled from "@emotion/styled";

import ComputerMidiKeyboard from "./ComputerMidiKeyboard";
import Octave from "./Octave";

const OctaveContainer = styled.div``;

export default function Keyboard() {
  const [triggerable, setTriggerable] = useState(false);

  const enableTriggering = () => {
    setTriggerable(true);
  };
  const disableTriggering = () => {
    setTriggerable(false);
  };

  return (
    <OctaveContainer
      onMouseDown={enableTriggering}
      onMouseUp={disableTriggering}
      onMouseLeave={disableTriggering}
    >
      <ComputerMidiKeyboard />
      <Octave triggerable={triggerable} octave={2} />
      <Octave triggerable={triggerable} octave={3} />
      <Octave triggerable={triggerable} octave={4} />
    </OctaveContainer>
  );
}
