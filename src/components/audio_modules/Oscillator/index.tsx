import { useEffect, useState } from "react";
import styled from "styled-components";

import Engine from "Engine";
import OscillatorModule from "Engine/modules/Oscillator";
import Note from "Engine/Note";

import Fader from "components/Fader";

interface OscillatorProps {
  title: string;
  amp?: boolean;
}

const OscillatorContainer = styled.div`
  border: 1px solid;
  padding: 5px;
  width: 200px;
`;

const FaderContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Title = styled.div`
  text-align: center;
  margin-bottom: 5px;
`;

const WAVES: { [key: number]: string } = {
  0: "sine",
  1: "triangle",
  2: "square",
  3: "sawtooth",
};

const RANGES: { [key: number]: string } = {
  0: " ",
  1: " ",
  2: " ",
  3: " ",
};

const Center: { [key: number]: string } = {
  0: "-",
};

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

    oscillator.wave = WAVES[wave];
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
        <Fader
          name="Octave"
          marks={RANGES}
          onChange={setRange}
          defaultValue={range}
          included={false}
        />
        <Fader
          name="Coarse"
          marks={Center}
          min={-12}
          max={12}
          onChange={setCoarse}
          defaultValue={coarse}
          included={false}
        />
        <Fader
          name="Fine"
          marks={Center}
          min={-100}
          max={100}
          onChange={setFine}
          defaultValue={fine}
          included={false}
        />
        <Fader
          name="Wave"
          marks={WAVES}
          onChange={setWave}
          defaultValue={wave}
          included={false}
        />
      </FaderContainer>
    </OscillatorContainer>
  );
}
