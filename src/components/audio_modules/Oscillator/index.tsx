import styled from "@emotion/styled";

import Fader, { MarkProps } from "components/Fader";

const Center: MarkProps[] = [{ value: 0, label: "-" }];

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
  { value: -1, label: "" },
  { value: 0, label: "" },
  { value: 1, label: "" },
  { value: 2, label: "" },
];

export default function Oscillator(props: {
  id: string;
  code: string;
  name: string;
  props: { range: number; coarse: number; fine: number; wave: string };
  updateProps: Function;
}) {
  const {
    id,
    updateProps,
    name: title,
    props: { range, coarse, fine, wave: waveName },
  } = props;

  const wave = WAVES.find((w) => w.label === waveName)?.value;

  const updateProp = (propName: string) => (value: number | string) => {
    if (propName === "wave")
      value = WAVES.find((w) => w.value === value)?.label || WAVES[0].label;

    updateProps(id, { [propName]: value });
  };

  return (
    <OscillatorContainer>
      <Title>{title}</Title>

      <FaderContainer>
        <Fader
          name="Octave"
          marks={RANGES}
          min={-1}
          max={2}
          onChange={updateProp("range")}
          value={range}
        />
        <Fader
          name="Coarse"
          marks={Center}
          min={-12}
          max={12}
          onChange={updateProp("coarse")}
          value={coarse}
        />
        <Fader
          name="Fine"
          marks={Center}
          min={-100}
          max={100}
          onChange={updateProp("fine")}
          value={fine}
        />
        <Fader
          name="Wave"
          marks={WAVES}
          onChange={updateProp("wave")}
          value={wave}
        />
      </FaderContainer>
    </OscillatorContainer>
  );
}
