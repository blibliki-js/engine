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
import Sequencer from "./Sequencer";

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
    case Oscillator.moduleName:
      return Oscillator;
    case Envelope.moduleName:
      return Envelope;
    case AmpEnvelope.moduleName:
      return AmpEnvelope;
    case FreqEnvelope.moduleName:
      return FreqEnvelope;
    case Filter.moduleName:
      return Filter;
    case Volume.moduleName:
      return Volume;
    case Master.moduleName:
      return Master;
    case VoiceScheduler.moduleName:
      return VoiceScheduler;
    case MidiSelector.moduleName:
      return MidiSelector;
    case VirtualMidi.moduleName:
      return VirtualMidi;
    case Reverb.moduleName:
      return Reverb;
    case Delay.moduleName:
      return Delay;
    case Distortion.moduleName:
      return Distortion;
    case BitCrusher.moduleName:
      return BitCrusher;
    case Sequencer.moduleName:
      return Sequencer;
    default:
      throw Error(`Unknown module type ${type}`);
  }
}
