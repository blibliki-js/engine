import { useEffect, useState } from "react";
import styled from "@emotion/styled";

import Engine from "Engine";
import OscillatorModule from "Engine/modules/Oscillator";
import Note from "Engine/Note";

import Fader, { MarkProps } from "components/Fader";

interface OscillatorProps {
  title: string;
  amp?: boolean;
}

const OscillatorContainer = styled.div`
  border: 1px solid;
  padding: 5px;
`;

const FaderContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Title = styled.div`
  text-align: center;
  margin-bottom: 5px;
`;

const WAVES: MarkProps[] = [
  { value: 0, label: "sine" },
  { value: 1, label: "triangle" },
  { value: 2, label: "square" },
  { value: 3, label: "sawtooth" },
];

const RANGES: MarkProps[] = [
  { value: 0, label: "" },
  { value: 1, label: "" },
  { value: 2, label: "" },
  { value: 3, label: "" },
];

const Center: MarkProps[] = [{ value: 0, label: "-" }];

export default function Oscillator(props: OscillatorProps) {
  const { title } = props;
  const [oscillator, setOscillator] = useState<OscillatorModule>();

  const [note, setNote] = useState<Note>(new Note("C4"));
  const [coarse, setCoarse] = useState<number>(0);
  const [fine, setFine] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [range, setRange] = useState<number>(1);

  useEffect(() => {
    const osc = new OscillatorModule(title);
    osc.note = note;

    setOscillator(osc);
    Engine.registerModule(osc);

    osc.start();
  }, []);

  useEffect(() => {
    if (!oscillator) return;

    oscillator.coarse = coarse;
  }, [oscillator, coarse]);

  useEffect(() => {
    if (!oscillator) return;

    oscillator.fine = fine;
  }, [oscillator, fine]);

  useEffect(() => {
    if (!oscillator) return;

    const newWave = WAVES.find((w) => w.value === wave);

    if (!newWave) return;

    oscillator.wave = newWave.label;
  }, [oscillator, wave]);

  useEffect(() => {
    if (!oscillator) return;

    oscillator.range = range - 1;
  }, [oscillator, range]);

  if (!oscillator) return null;

  return (
    <OscillatorContainer>
      <Title>{title}</Title>

      <FaderContainer>
        <Fader name="Octave" marks={RANGES} onChange={setRange} value={range} />
        <Fader
          name="Coarse"
          marks={Center}
          min={-12}
          max={12}
          onChange={setCoarse}
          value={coarse}
        />
        <Fader
          name="Fine"
          marks={Center}
          min={-100}
          max={100}
          onChange={setFine}
          value={fine}
        />
        <Fader name="Wave" marks={WAVES} onChange={setWave} value={wave} />
      </FaderContainer>
    </OscillatorContainer>
  );
}
