import { Envelope, AmpEnvelope, FreqEnvelope } from "./Envelope";
import Oscillator, { MonoOscillator } from "./Oscillator";
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
import LFO from "./LFO";
import { AudioModule } from "../core/Module";

export { default as Master } from "./Master";
export { default as Filter } from "./Filter";
export { default as Oscillator, MonoOscillator } from "./Oscillator";
export { default as VirtualMidi } from "./VirtualMidi";
export { default as VoiceScheduler } from "./VoiceScheduler";
export { default as Sequencer } from "./Sequencer";
export type { ISequence } from "./Sequencer";

export {
  Envelope,
  AmpEnvelope,
  FreqEnvelope,
  EnvelopeStages,
} from "./Envelope";

export interface ICreateModule {
  id?: string;
  name: string;
  numberOfVoices?: number;
  type: string;
  props: any;
}

export function createModule(params: ICreateModule): AudioModule {
  const { id, type, name, props } = params;
  const klass = moduleClassFromType(type);

  return new klass({ id, name, props });
}

function moduleClassFromType(type: string) {
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
    case LFO.moduleName:
      return LFO;
    default:
      throw Error(`Unknown module type ${type}`);
  }
}
