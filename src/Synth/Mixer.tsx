import Volume from "components/audio_modules/Volume";
import { selectModulesByType } from "Engine/Module/modulesSlice";
import { useAppSelector } from "hooks";

export default function Mixer() {
  const oscillators = useAppSelector((state) =>
    selectModulesByType(state, "oscillator")
  );

  if (!oscillators.length) return null;

  return (
    <div>
      {oscillators.map((osc) => (
        <Volume
          key={osc.code}
          code={osc.code}
          name={osc.name}
          volume={osc.props.volume}
        />
      ))}
    </div>
  );
}
