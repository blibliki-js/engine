import Envelope from "components/audio_modules/Envelope";
import Filter from "components/audio_modules/Filter";

export default function EnvelopesAndFilter() {
  return (
    <div>
      <Envelope title="Amp Envelope" type="amplitude" />
      <Envelope title="Freq Envelope" type="frequency" />
      <Filter title="Filter" />
    </div>
  );
}
