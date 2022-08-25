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
  onChange(values: any, calculatedValues: any): void;
  defaultValue?: number | Array<number>;
  value?: number | Array<number>;
  marks?: MarkProps[];
  max?: number;
  min?: number;
  step?: number;
  exp?: number;
  track?: false | "normal" | "inverted";
}

const calcValue = function (
  value: number | number[] | undefined,
  min: number,
  max: number,
  exp?: number
) {
  if (!value || !exp) return value;
  if (Array.isArray(value)) throw Error("Array not supported yet");

  const range = max - min;
  const coeff = Math.pow((value - min) / range, exp);

  return min + coeff * range;
};

const revCalcValue = function (
  value: number | number[] | undefined,
  min: number,
  max: number,
  exp?: number
) {
  if (!value || !exp) return value;
  if (Array.isArray(value)) throw Error("Array not supported yet");

  const range = max - min;
  return Math.round(Math.pow((value - min) / range, 1 / exp) * range + min);
};

export default function Fader(props: FaderProps) {
  const {
    name,
    onChange,
    value,
    defaultValue,
    marks,
    exp,
    min = 0,
    track = false,
  } = props;

  let { max, step } = props;

  if (marks) {
    step ??= 1;
  }

  if (max === undefined) {
    max = marks ? marks.length - 1 : 1;
  }

  const revValue = revCalcValue(value, min, max, exp);

  const internalOnChange = (_: any, newValue?: number | number[]) =>
    onChange(newValue, calcValue(newValue, min, max || 1, exp));

  return (
    <Container>
      <StyledSlider
        orientation="vertical"
        onChange={internalOnChange}
        value={revValue}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step || 0.01}
        marks={marks}
        track={track}
      />
      <div>{name}</div>
    </Container>
  );
}
