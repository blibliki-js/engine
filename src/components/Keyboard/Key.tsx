import { useMemo } from "react";
import styled from "@emotion/styled";

import Engine from "Engine";
import Note from "Engine/Note";

interface StyleProps {
  toneWidth: number;
  toneHeight: number;
  semiToneWidth: number;
  semiToneHeight: number;
}

const WhiteKey = styled.div<StyleProps>`
  position: relative;
  background: #fff;
  border: 1px solid #000;
  width: ${(props) => props.toneWidth}px;
  height: ${(props) => props.toneHeight}px;
  border-radius: 0 0 5px 5px;
  margin-right: 1px;

  &.active {
    box-shadow: inset 0 0 20px rgba(0 0 0 / 25%);
    transform: scaleY(0.99);
    -webkit-transform-origin-y: 0;
  }
`;

const BlackKey = styled.div<StyleProps>`
  background: #000;
  z-index: 2;
  width: ${(props) => props.semiToneWidth}px;
  height: ${(props) => props.semiToneHeight}px;
  border-radius: 0 0 5px 5px;

  &.active {
    box-shadow: inset 0 0 20px rgba(255 255 255 / 60%);
    transform: scaleY(0.99);
    -webkit-transform-origin-y: 0;
  }
`;

const C = styled(WhiteKey)`
  grid-column: 1 / span 2;
  grid-row: 1 / span 2;
`;

const CSharp = styled(BlackKey)`
  grid-column: 2 / span 2;
  grid-row: 1;
`;

const D = styled(WhiteKey)`
  grid-column: 3 / span 2;
  grid-row: 1 / span 2;
`;

const DSharp = styled(BlackKey)`
  grid-column: 5 / span 2;
  grid-row: 1;
`;

const E = styled(WhiteKey)`
  grid-column: 6 / span 2;
  grid-row: 1 / span 2;
`;

const F = styled(WhiteKey)`
  grid-column: 8 / span 2;
  grid-row: 1 / span 2;
`;

const FSharp = styled(BlackKey)`
  grid-column: 9 / span 2;
  grid-row: 1;
`;

const G = styled(WhiteKey)`
  grid-column: 10 / span 2;
  grid-row: 1 / span 2;
`;

const GSharp = styled(BlackKey)`
  grid-column: 12 / span 2;
  grid-row: 1;
`;

const A = styled(WhiteKey)`
  grid-column: 13 / span 2;
  grid-row: 1 / span 2;
`;

const ASharp = styled(BlackKey)`
  grid-column: 15 / span 2;
  grid-row: 1;
`;

const B = styled(WhiteKey)`
  grid-column: 16 / span 2;
  grid-row: 1 / span 2;
`;

const Keys: { [key: string]: any } = {
  C: C,
  "C#": CSharp,
  D: D,
  "D#": DSharp,
  E: E,
  F: F,
  "F#": FSharp,
  G: G,
  "G#": GSharp,
  A: A,
  "A#": ASharp,
  B: B,
};

interface KeyProps extends StyleProps {
  note: Note;
  active: boolean;
  triggerable: boolean;
}

export default function Key(props: KeyProps) {
  const {
    note,
    active,
    triggerable,
    toneWidth,
    toneHeight,
    semiToneWidth,
    semiToneHeight,
  } = props;

  const className = useMemo(() => {
    const names = [];

    if (active) names.push("active");

    return names.join(" ");
  }, [active]);

  const CurrentKey = useMemo(() => Keys[note.name], [note]);

  const trigger = useMemo(
    () =>
      (type: string, force: boolean = false) =>
      () => {
        if (type === "noteOn" && !triggerable && !force) return;

        Engine.triggerKey(note.fullName, type);
      },
    [triggerable, note.fullName]
  );

  return (
    <CurrentKey
      onMouseEnter={trigger("noteOn")}
      onMouseLeave={trigger("noteOff")}
      onMouseDown={trigger("noteOn", true)}
      onMouseUp={trigger("noteOff", true)}
      toneWidth={toneWidth}
      toneHeight={toneHeight}
      semiToneWidth={semiToneWidth}
      semiToneHeight={semiToneHeight}
      className={className}
    />
  );
}
