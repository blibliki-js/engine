import { useState, useEffect } from "react";
import styled from "@emotion/styled";

import Engine from "Engine";
import {
  AmpEnvelope as AmpEnvelopeModule,
  EnvelopeStages,
} from "Engine/modules/Envelope";

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
  amp?: boolean;
}

export default function AmpEnvelope(props: EnvelopeProps) {
  const { title, amp } = props;
  const [envelope, setEnvelope] = useState<AmpEnvelopeModule>();

  useEffect(() => {
    const env = new AmpEnvelopeModule(title);
    setEnvelope(env);
    Engine.registerModule(env);
  }, [amp, title]);

  if (!envelope) return null;

  const onChange = (stage: EnvelopeStages) => (value: any) => {
    envelope.setStage(stage, value);
  };

  return (
    <EnvelopeContainer>
      <Title>{title}</Title>

      <FaderContainer>
        <Fader
          name="A"
          onChange={onChange(EnvelopeStages.Attack)}
          value={envelope.getStage(EnvelopeStages.Decay)}
        />
        <Fader
          name="D"
          onChange={onChange(EnvelopeStages.Decay)}
          value={envelope.getStage(EnvelopeStages.Decay)}
        />
        <Fader
          name="S"
          onChange={onChange(EnvelopeStages.Sustain)}
          value={envelope.getStage(EnvelopeStages.Sustain)}
        />
        <Fader
          name="R"
          onChange={onChange(EnvelopeStages.Release)}
          value={envelope.getStage(EnvelopeStages.Release)}
        />
      </FaderContainer>
    </EnvelopeContainer>
  );
}
