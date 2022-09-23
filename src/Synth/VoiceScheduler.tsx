import { useModules } from "hooks";
import AudioModule from "components/audio_modules";
import { ModuleType } from "Engine/Module";

const INITIAL_MODULE_PROPS = [
  {
    name: "Voice scheduler",
    code: "voiceScheduler",
    type: ModuleType.VoiceScheduler,
    props: { numberOfVoices: 6 },
  },
];

export default function MidiDeviceSelector() {
  const [voiceScheduler] = useModules(INITIAL_MODULE_PROPS);

  if (!voiceScheduler) return null;

  return <AudioModule module={voiceScheduler} />;
}
