import { Slider } from "@mui/material";
import styled from "@emotion/styled";

const StyledSlider = styled(Slider)`
  margin-bottom: 10px;
  height: 100px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export interface MarkProps {
  value: number;
  label: string;
}

interface FaderProps {
  name: String;
  onChange(values: any): void;
  defaultValue?: number | Array<number>;
  value?: number | Array<number>;
  marks?: MarkProps[];
  max?: number;
  min?: number;
  step?: number;
  track?: false | "normal" | "inverted";
}

export default function Fader(props: FaderProps) {
  const {
    name,
    onChange,
    value,
    defaultValue,
    marks,
    min,
    track = false,
  } = props;
  let { max, step } = props;

  if (marks) {
    const count = Object.keys(marks).length;
    max ??= count - 1;
    step ??= 1;
  }

  const internalOnChange = (_: any, newValue: any) => onChange(newValue);

  return (
    <Container>
      <StyledSlider
        orientation="vertical"
        onChange={internalOnChange}
        value={value}
        defaultValue={defaultValue}
        min={min || 0}
        max={max || 1}
        step={step || 0.01}
        marks={marks}
        track={track}
      />
      <div>{name}</div>
    </Container>
  );
}
