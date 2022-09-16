import { updateModule } from "Engine/Module/modulesSlice";
import { useAppDispatch } from "hooks";

import Oscillator from "components/audio_modules/Oscillator";
import Envelope from "components/audio_modules/Envelope";
import Filter from "components/audio_modules/Filter";
import Volume from "components/audio_modules/Volume";

interface AudioModuleProps {
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
  const { code, name, type, props } = audioModuleProps.module;

  const componentType =
    audioModuleProps.componentType || audioModuleProps.module.type;
  let Component;

  const updateProps = (code: string, props: any) => {
    dispatch(updateModule({ id: code, changes: { props } }));
  };

  switch (componentType) {
    case "oscillator":
      Component = Oscillator;
      break;
    case "filter":
      Component = Filter;
      break;
    case "volume":
      Component = Volume;
      break;
    case "envelope":
    case "ampEnvelope":
    case "freqEnvelope":
      Component = Envelope;
      break;
    default:
      throw Error(`Unknown audio module type ${type}`);
  }

  return (
    <Component
      code={code}
      name={name}
      props={props}
      updateProps={updateProps}
    />
  );
}
