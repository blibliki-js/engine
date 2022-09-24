import { useModules } from "hooks";
import AudioModule from "components/audio_modules";
import { ModuleType } from "Engine/Module";

const INITIAL_MODULE_PROPS = [
  {
    name: "Midi Selector",
    code: "midiSelector",
    type: ModuleType.MidiSelector,
  },
];

export default function MidiDeviceSelector() {
  const [midiSelector] = useModules(INITIAL_MODULE_PROPS);

  if (!midiSelector) return null;

  return <AudioModule module={midiSelector} />;
}
