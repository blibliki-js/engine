import { useModules } from "hooks";
import AudioModule from "components/audio_modules";
import { ModuleType } from "Engine/Module";

const INITIAL_MODULE_PROPS = [
  {
    name: "Osc 1",
    code: "osc1",
    type: ModuleType.Oscillator,
    props: {
      wave: "square",
      volume: -30,
    },
  },
  { name: "Osc 2", code: "osc2", type: ModuleType.Oscillator },
  { name: "Osc 3", code: "osc3", type: ModuleType.Oscillator },
];

export default function Oscillators() {
  const modules = useModules(INITIAL_MODULE_PROPS);

  if (modules.length !== 3) return null;

  const [osc1, osc2, osc3] = modules;

  return (
    <div>
      <AudioModule module={osc1} />
      <AudioModule module={osc2} />
      <AudioModule module={osc3} />
    </div>
  );
}
