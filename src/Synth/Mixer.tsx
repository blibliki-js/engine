import { selectModulesByType } from "Engine/Module/modulesSlice";
import { useAppSelector } from "hooks";
import AudioModule from "components/audio_modules";

export default function Mixer() {
  const oscillators = useAppSelector((state) =>
    selectModulesByType(state, "oscillator")
  );

  return (
    <div>
      {oscillators.map((osc) => (
        <AudioModule key={osc.code} module={osc} componentType="volume" />
      ))}
    </div>
  );
}
