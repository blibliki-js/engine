import { useEffect, useState } from "react";
import styled from "@emotion/styled";

import Engine from "Engine";
import FilterModule from "Engine/modules/Filter";

import Fader, { MarkProps } from "components/Fader";

interface FilterProps {
  title: string;
  code: string;
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

const Center: MarkProps[] = [{ value: 2500, label: "-" }];
const AmountCenter: MarkProps[] = [{ value: 0, label: "-" }];

export default function Filter(props: FilterProps) {
  const { title, code } = props;
  const [filter, setFilter] = useState<FilterModule>();

  const [cutoff, setCutoff] = useState<number>(5000);
  const [resonance, setResonance] = useState<number>(0);
  const [envelopeAmount, setEnvelopeAmount] = useState<number>(0);

  useEffect(() => {
    const f = new FilterModule(title, code);
    setFilter(f);
    Engine.registerModule(f);
  }, []);

  useEffect(() => {
    if (!filter) return;

    filter.cutoff = cutoff;
  }, [filter, cutoff]);

  useEffect(() => {
    if (!filter) return;

    filter.resonance = resonance;
  }, [filter, resonance]);

  useEffect(() => {
    if (!filter) return;

    filter.envelopeAmount = envelopeAmount;
  }, [filter, envelopeAmount]);

  if (!filter) return null;

  return (
    <FilterContainer>
      <Title>{title}</Title>

      <FaderContainer>
        <Fader
          name="Cutoff"
          marks={Center}
          min={0}
          max={5000}
          onChange={setCutoff}
          value={cutoff}
        />
        <Fader
          name="Resonance"
          min={0}
          max={100}
          onChange={setResonance}
          value={resonance}
        />
        <Fader
          name="Amount"
          marks={AmountCenter}
          min={-8}
          max={8}
          step={0.2}
          onChange={setEnvelopeAmount}
          value={envelopeAmount}
        />
      </FaderContainer>
    </FilterContainer>
  );
}
