import { useState, useEffect } from "react";
import styled from "styled-components";

import Engine from "Engine";
import EnvelopeModule, { EnvelopeStages } from "Engine/modules/Envelope";

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

export default function Envelope(props: EnvelopeProps) {
  const { title, amp } = props;
  const [envelope, setEnvelope] = useState<EnvelopeModule>();

  useEffect(() => {
    const env = new EnvelopeModule(title);
    setEnvelope(env);
    Engine.registerModule(env);
  }, [amp, title]);

  if (!envelope) return null;

  const onChange = (stage: EnvelopeStages) => (value: any) => {
    envelope.setStage(stage, value);
  };

  const trigger = () => {
    envelope.triggerAttack();
  };

  const release = () => {
    envelope.triggerRelease();
  };

  return (
    <EnvelopeContainer>
      <Title>{title}</Title>

      <div>
        <button onClick={trigger}>Trigger</button>
        <button onClick={release}>Release</button>
      </div>

      <FaderContainer>
        <Fader
          name="A"
          onChange={onChange(EnvelopeStages.Attack)}
          defaultValue={envelope.getStage(EnvelopeStages.Decay)}
        />
        <Fader
          name="D"
          onChange={onChange(EnvelopeStages.Decay)}
          defaultValue={envelope.getStage(EnvelopeStages.Decay)}
        />
        <Fader
          name="S"
          onChange={onChange(EnvelopeStages.Sustain)}
          defaultValue={envelope.getStage(EnvelopeStages.Sustain)}
        />
        <Fader
          name="R"
          onChange={onChange(EnvelopeStages.Release)}
          defaultValue={envelope.getStage(EnvelopeStages.Release)}
        />
      </FaderContainer>
    </EnvelopeContainer>
  );
}
