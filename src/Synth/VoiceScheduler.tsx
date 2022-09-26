import { useModules } from "hooks";
import AudioModule from "components/audio_modules";
import { PolyModuleType } from "Engine/Module";

const INITIAL_MODULE_PROPS = [
  {
    name: "Voice scheduler",
    code: "voiceScheduler",
    type: PolyModuleType.VoiceScheduler,
    props: { numberOfVoices: 6 },
  },
];

export default function MidiDeviceSelector() {
  const [voiceScheduler] = useModules(INITIAL_MODULE_PROPS);

  if (!voiceScheduler) return null;

  return <AudioModule module={voiceScheduler} />;
}
