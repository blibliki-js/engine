import styled from "@emotion/styled";

import Engine from "Engine";
import { useAppSelector } from "hooks";
import { modulesSelector } from "Engine/Module/modulesSlice";

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
  id: string;
}

export default function Envelope(props: EnvelopeProps) {
  const { id } = props;

  const {
    name,
    props: { attack, decay, sustain, release },
  } = useAppSelector((state) => modulesSelector.selectById(state, id)) || {};

  const updateProp = (propName: string) => (value: number | string) => {
    Engine.updatePropModule(id, { [propName]: value });
  };

  return (
    <EnvelopeContainer>
      <Title>{name}</Title>

      <FaderContainer>
        <Fader name="A" onChange={updateProp("attack")} value={attack} />
        <Fader name="D" onChange={updateProp("decay")} value={decay} />
        <Fader name="S" onChange={updateProp("sustain")} value={sustain} />
        <Fader name="R" onChange={updateProp("release")} value={release} />
      </FaderContainer>
    </EnvelopeContainer>
  );
}
