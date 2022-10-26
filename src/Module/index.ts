import { camelCase, upperFirst } from "lodash";
import Module, { Connectable } from "./Base";
import PolyModule from "./PolyModule";
import Oscillator from "./Oscillator";
import { Envelope, AmpEnvelope, FreqEnvelope } from "./Envelope";
import Filter from "./Filter";
import Master from "./Master";
import VoiceScheduler from "./VoiceScheduler";
import MidiSelector from "./MidiSelector";
import Volume from "./Volume";
import VirtualMidi from "./VirtualMidi";
import Reverb from "./Reverb";
import Delay from "./Delay";
import Distortion from "./Distortion";
import BitCrusher from "./BitCrusher";

export { default } from "./Base";
export { default as PolyModule } from "./PolyModule";
export type { ModuleInterface, Connectable, Triggerable } from "./Base";

export { default as Filter } from "./Filter";
export { default as Oscillator } from "./Oscillator";
export {
  Envelope,
  AmpEnvelope,
  FreqEnvelope,
  EnvelopeStages,
} from "./Envelope";

export type AudioModule =
  | Module<Connectable, any>
  | PolyModule<Module<Connectable, any>, any>;

export function createModule(
  name: string,
  type: string,
  props: any
): AudioModule {
  const klass = moduleClassFromType(type);

  return new klass(name, props);
}

function moduleClassFromType(type: string) {
  type = upperFirst(camelCase(type));

  switch (type) {
    case Oscillator.name:
      return Oscillator;
    case Envelope.name:
      return Envelope;
    case AmpEnvelope.name:
      return AmpEnvelope;
    case FreqEnvelope.name:
      return FreqEnvelope;
    case Filter.name:
      return Filter;
    case Volume.name:
      return Volume;
    case Master.name:
      return Master;
    case VoiceScheduler.name:
      return VoiceScheduler;
    case MidiSelector.name:
      return MidiSelector;
    case VirtualMidi.name:
      return VirtualMidi;
    case Reverb.name:
      return Reverb;
    case Delay.name:
      return Delay;
    case Distortion.name:
      return Distortion;
    case BitCrusher.name:
      return BitCrusher;
    default:
      throw Error(`Unknown module type ${type}`);
  }
}
