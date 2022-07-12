import { useState, useEffect } from "react";
import styled from "@emotion/styled";

import Engine from "Engine";
import {
  Envelope as EnvelopeModule,
  AmpEnvelope as AmpEnvelopeModule,
  FreqEnvelope as FreqEnvelopeModule,
  EnvelopeStages,
} from "Engine/Module";

import Fader from "components/Fader";

const EnvelopeContainer = styled.div`
  border: 1px solid;
  padding: 5px;
  width: 150px;
`;

const Title = styled.div`
  text-align: center;
  margin-bottom: 5px;
`;

const FaderContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

interface EnvelopeProps {
  title: string;
  code: string;
  type?: "base" | "amplitude" | "frequency";
}

export default function Envelope(props: EnvelopeProps) {
  const { title, code, type = "base" } = props;
  const [envelope, setEnvelope] = useState<EnvelopeModule>();

  const [attack, setAttack] = useState<number>(0.01);
  const [decay, setDecay] = useState<number>(0.01);
  const [sustain, setSustain] = useState<number>(1);
  const [release, setRelease] = useState<number>(0.01);

  useEffect(() => {
    let envModule;

    switch (type) {
      case "base":
        envModule = EnvelopeModule;
        break;
      case "amplitude":
        envModule = AmpEnvelopeModule;
        break;
      case "frequency":
        envModule = FreqEnvelopeModule;
        break;
    }

    const env = new envModule(title, code);
    setEnvelope(env);
    Engine.registerModule(env);
  }, [type, title, code]);

  if (!envelope) return null;

  const onChange = (stage: EnvelopeStages) => (value: number) => {
    envelope.setStage(stage, value);

    switch (stage) {
      case "attack":
        setAttack(value);
        break;
      case "decay":
        setDecay(value);
        break;
      case "sustain":
        setSustain(value);
        break;
      case "release":
        setRelease(value);
        break;
    }
  };

  return (
    <EnvelopeContainer>
      <Title>{title}</Title>

      <FaderContainer>
        <Fader
          name="A"
          onChange={onChange(EnvelopeStages.Attack)}
          value={attack}
        />
        <Fader
          name="D"
          onChange={onChange(EnvelopeStages.Decay)}
          value={decay}
        />
        <Fader
          name="S"
          onChange={onChange(EnvelopeStages.Sustain)}
          value={sustain}
        />
        <Fader
          name="R"
          onChange={onChange(EnvelopeStages.Release)}
          value={release}
        />
      </FaderContainer>
    </EnvelopeContainer>
  );
}
