import styled from "@emotion/styled";

import Fader, { MarkProps } from "components/Fader";

interface FilterProps {
  id: string;
  name: string;
  code: string;
  updateProps: Function;
  props: { cutoff: number; resonance: number; envelopeAmount: number };
}

const FilterContainer = styled.div`
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

const AmountCenter: MarkProps[] = [{ value: 0, label: "-" }];

export default function Filter(props: FilterProps) {
  const {
    id,
    updateProps,
    name: title,
    props: { cutoff, resonance, envelopeAmount },
  } = props;

  const updateProp =
    (propName: string) => (value: number, calcValue: number) => {
      const currentVal = propName === "cutoff" ? calcValue : value;
      updateProps(id, { [propName]: currentVal });
    };

  return (
    <FilterContainer>
      <Title>{title}</Title>

      <FaderContainer>
        <Fader
          name="Hz"
          min={20}
          max={20000}
          onChange={updateProp("cutoff")}
          value={cutoff}
          exp={4}
        />
        <Fader
          name="Q"
          min={0}
          max={100}
          onChange={updateProp("resonance")}
          value={resonance}
        />
        <Fader
          name="Amount"
          marks={AmountCenter}
          min={-8}
          max={8}
          step={0.2}
          onChange={updateProp("envelopeAmount")}
          value={envelopeAmount}
        />
      </FaderContainer>
    </FilterContainer>
  );
}
