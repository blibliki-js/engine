import Oscillator from "components/audio_modules/Oscillator";
import Envelope from "components/audio_modules/Envelope";
import Filter from "components/audio_modules/Filter";

interface AudioModuleProps {
  name: string;
  code: string;
  type: string;
  props?: any;
}

export default function AudioModule(audioModuleProps: {
  module: AudioModuleProps;
}) {
  const { code, name, type, props } = audioModuleProps.module;
  let Component;

  switch (type) {
    case "oscillator":
      Component = Oscillator;
      break;
    case "filter":
      Component = Filter;
      break;
    case "envelope":
    case "ampEnvelope":
    case "freqEnvelope":
      Component = Envelope;
      break;
    default:
      throw Error(`Unknown audio module type ${type}`);
  }

  return <Component code={code} name={name} props={props} />;
}
