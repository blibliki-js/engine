import styled from "@emotion/styled";

import Fader from "components/Fader";

interface VolumeProps {
  id: string;
  name: string;
  code: string;
  updateProps: Function;
  props: any;
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
  const {
    id,
    name,
    updateProps,
    props: { volume },
  } = props;

  const updateVolume = (value: number) => {
    updateProps(id, { volume: value });
  };

  return (
    <VolumeContainer>
      <Title>Volume</Title>

      <Fader
        name={name || ""}
        onChange={updateVolume}
        value={volume}
        min={-100}
        max={0}
        step={1}
      />
    </VolumeContainer>
  );
}
