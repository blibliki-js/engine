import { useModules } from "hooks";
import AudioModule from "components/audio_modules";

const INITIAL_MODULE_PROPS = [
  { name: "Filter", code: "filter", type: "filter" },
  { name: "Amp Envelope", code: "amplitude", type: "ampEnvelope" },
  { name: "Freq Envelope", code: "frequency", type: "freqEnvelope" },
];

export default function EnvelopesAndFilter() {
  const modules = useModules(INITIAL_MODULE_PROPS);

  if (modules.length !== 3) return null;

  const [filter, ampEnv, freEnv] = modules;

  return (
    <div>
      <AudioModule module={ampEnv} />
      <AudioModule module={freEnv} />
      <AudioModule module={filter} />
    </div>
  );
}
