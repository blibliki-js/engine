import styled from "@emotion/styled";

import { useAppSelector } from "hooks";
import Note from "Engine/Note";
import Key from "./Key";

const toneWidth = 25.3;
const toneHeight = toneWidth * 5;
const semiToneWidth = toneWidth * 0.8;
const semiToneHeight = 24 * 4;

const toneWidthColumn = `${(toneWidth * 2.0) / 3}px`;
const semiToneWidthColumn = `${(toneWidth * 1.0) / 3}px`;

const OctaveContainer = styled.div`
  display: inline-grid;
  grid-template-columns:
    ${toneWidthColumn} ${semiToneWidthColumn}
    ${semiToneWidthColumn} ${semiToneWidthColumn} ${semiToneWidthColumn}
    ${semiToneWidthColumn} ${toneWidthColumn}
    ${toneWidthColumn} ${semiToneWidthColumn}
    ${semiToneWidthColumn} ${semiToneWidthColumn} ${semiToneWidthColumn}
    ${semiToneWidthColumn} ${semiToneWidthColumn} ${semiToneWidthColumn}
    ${semiToneWidthColumn} ${toneWidthColumn};
  grid-template-rows: ${semiToneHeight}px;
`;

interface OctaveProps {
  octave: number;
  triggerable: boolean;
}

export default function Octave(props: OctaveProps) {
  const { octave, triggerable } = props;
  const { activeNotes } = useAppSelector((state) => state.global);

  return (
    <OctaveContainer>
      {Note.notes(octave).map((note: Note) => (
        <Key
          key={note.fullName}
          triggerable={triggerable}
          toneWidth={toneWidth}
          semiToneWidth={semiToneWidth}
          toneHeight={toneHeight}
          semiToneHeight={semiToneHeight}
          note={note}
          active={activeNote(activeNotes, note)}
        />
      ))}
    </OctaveContainer>
  );
}

function activeNote(activeNotes: string[], note: Note) {
  return activeNotes.some((n) => n === note.fullName);
}
