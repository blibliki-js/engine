import Oscillator from "components/audio_modules/Oscillator";

export default function Oscillators() {
  return (
    <div>
      <Oscillator title="Osc 1" code="osc1" />
      <Oscillator title="Osc 2" code="osc2" />
      <Oscillator title="Osc 3" code="osc3" />
    </div>
  );
}
