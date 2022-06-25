import styled from "styled-components";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const StyledSlider = styled(Slider)`
  margin-bottom: 10px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100px;
`;

interface FaderProps {
  name: String;
  onChange(values: any): void;
  defaultValue?: number | Array<number>;
  marks?: { [key: number]: string };
  max?: number;
  min?: number;
  step?: number;
  included?: boolean;
  range?: boolean;
}

export default function Fader(props: FaderProps) {
  const {
    name,
    onChange,
    defaultValue,
    marks,
    included,
    min,
    range = false,
  } = props;
  let { max, step } = props;

  if (marks) {
    const count = Object.keys(marks).length;
    max ??= count - 1;
    step ??= 1;
  }

  return (
    <Container>
      <StyledSlider
        vertical={true}
        onChange={onChange}
        defaultValue={defaultValue}
        min={min || 0}
        max={max || 1}
        step={step || 0.1}
        included={included}
        marks={marks}
        range={range}
      />
      <div>{name}</div>
    </Container>
  );
}
