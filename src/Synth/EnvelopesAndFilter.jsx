import { useState, useEffect } from "react";
import Envelope from "components/audio_modules/Envelope";
import Filter from "components/audio_modules/Filter";
import Engine from "Engine";

export default function EnvelopesAndFilter() {
  const [filterId, setFilterId] = useState();
  const [ampEnvelopeId, setAmpEnvelopeId] = useState();
  const [freqEnvelopeId, setFreqEnvelopeId] = useState();

  useEffect(() => {
    setFilterId(Engine.registerModule("Filter", "filter", "filter", {}));
    setAmpEnvelopeId(
      Engine.registerModule("Amp Envelope", "amplitude", "ampEnvelope", {})
    );
    setFreqEnvelopeId(
      Engine.registerModule("Freq Envelope", "frequency", "freqEnvelope", {})
    );
  }, [setFilterId, setFreqEnvelopeId, setAmpEnvelopeId]);

  if (!filterId || !ampEnvelopeId || !freqEnvelopeId) return null;

  return (
    <div>
      <Envelope id={ampEnvelopeId} />
      <Envelope id={freqEnvelopeId} />
      <Filter id={filterId} />
    </div>
  );
}
