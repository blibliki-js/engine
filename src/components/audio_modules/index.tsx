import { updateModule } from "Engine/Module/modulesSlice";
import { useAppDispatch } from "hooks";

import Oscillator from "components/audio_modules/Oscillator";
import Envelope from "components/audio_modules/Envelope";
import Filter from "components/audio_modules/Filter";
import Volume from "components/audio_modules/Volume";
import MidiDeviceSelector from "components/MidiDeviceSelector";
import VoiceScheduler from "components/VoiceScheduler";

interface AudioModuleProps {
  id: string;
  name: string;
  code: string;
  type: string;
  props?: any;
}

export default function AudioModule(audioModuleProps: {
  module: AudioModuleProps;
  componentType?: string;
}) {
  const dispatch = useAppDispatch();
  const { id, code, name, type, props } = audioModuleProps.module;

  const componentType =
    audioModuleProps.componentType || audioModuleProps.module.type;
  let Component;

  const updateProps = (id: string, props: any) => {
    dispatch(updateModule({ id, changes: { props } }));
  };

  switch (componentType) {
    case "oscillator":
    case "monoOscillator":
      Component = Oscillator;
      break;
    case "filter":
    case "monoFilter":
      Component = Filter;
      break;
    case "volume":
      Component = Volume;
      break;
    case "envelope":
    case "ampEnvelope":
    case "freqEnvelope":
    case "monoEnvelope":
    case "monoAmpEnvelope":
    case "monoFreqEnvelope":
      Component = Envelope;
      break;
    case "midiSelector":
      Component = MidiDeviceSelector;
      break;
    case "voiceScheduler":
      Component = VoiceScheduler;
      break;
    default:
      throw Error(`Unknown audio module type ${type}`);
  }

  return (
    <Component
      id={id}
      code={code}
      name={name}
      props={props}
      updateProps={updateProps}
    />
  );
}
