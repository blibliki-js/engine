import { selectModulesByType } from "Engine/Module/modulesSlice";
import { useAppSelector } from "hooks";
import AudioModule from "components/audio_modules";

export default function Mixer() {
  const oscillators = useAppSelector((state) =>
    selectModulesByType(state, "oscillator")
  );

  if (oscillators.length !== 3 || oscillators.some((o) => !o.initialized))
    return null;

  return (
    <div>
      {oscillators.map((osc) => (
        <AudioModule key={osc.code} module={osc} componentType="volume" />
      ))}
    </div>
  );
}
