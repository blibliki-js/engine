import styled from "@emotion/styled";

import Engine from "Engine";
import { useAppSelector } from "hooks";
import { modulesSelector } from "Engine/Module/modulesSlice";

import Fader, { MarkProps } from "components/Fader";

interface FilterProps {
  id: string;
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
  const { id } = props;
  const {
    name: title,
    props: { cutoff, resonance, envelopeAmount },
  } = useAppSelector((state) => modulesSelector.selectById(state, id)) || {};

  const updateProp = (propName: string) => (value: number | string) => {
    Engine.updatePropModule(id, { [propName]: value });
  };

  return (
    <FilterContainer>
      <Title>{title}</Title>

      <FaderContainer>
        <Fader
          name="Hz"
          min={0}
          max={5000}
          onChange={updateProp("cutoff")}
          value={cutoff}
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
