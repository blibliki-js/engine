import { useEffect, useState } from "react";
import styled from "@emotion/styled";

import Engine from "Engine";
import Oscillator from "Engine/modules/Oscillator";
import Fader from "components/Fader";

interface VolumeProps {
  title: string;
  defaultVolume?: number;
}

const VolumeContainer = styled.div`
  border: 1px solid;
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.div`
  text-align: center;
  margin-bottom: 5px;
`;

export default function Volume(props: VolumeProps) {
  const { title, defaultVolume = -10 } = props;
  const [oscillator, setOscillator] = useState<Oscillator>();
  const [volume, setVolume] = useState<number>(defaultVolume);

  useEffect(() => {
    const osc = Engine.getModuleByName(title) as Oscillator;

    setOscillator(osc);
    setVolume(osc.volume);
  }, []);

  useEffect(() => {
    if (!oscillator) return;

    oscillator.volume = volume;
  }, [oscillator, volume]);

  return (
    <VolumeContainer>
      <Title>Volume</Title>

      <Fader
        name={title}
        onChange={setVolume}
        value={volume}
        min={-100}
        max={0}
        step={1}
      />
    </VolumeContainer>
  );
}
