import Volume from "components/audio_modules/Volume";

export default function Mixer() {
  return (
    <div>
      <Volume title="Osc 1" />
      <Volume title="Osc 2" />
      <Volume title="Osc 3" />
    </div>
  );
}
