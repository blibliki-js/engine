import Module, { Connectable, ModuleType } from "./Base";
import PolyModule, { PolyModuleType } from "./PolyModule";
import Oscillator, { PolyOscillator } from "./Oscillator";
import { Envelope, AmpEnvelope, FreqEnvelope } from "./Envelope";
import Filter, { PolyFilter } from "./Filter";
import Master from "./Master";
import VoiceScheduler, { Voice } from "./VoiceScheduler";
import MidiSelector from "./MidiSelector";
import { PolyAmpEnvelope } from "./Envelope/AmpEnvelope";
import { PolyFreqEnvelope } from "./Envelope/FreqEnvelope";
import { PolyEnvelope } from "./Envelope/Base";
import Volume, { PolyVolume } from "./Volume";

export { default, ModuleType } from "./Base";
export { default as PolyModule, PolyModuleType } from "./PolyModule";
export type { Connectable, Triggerable } from "./Base";

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
  code: string,
  type: string,
  props: any
): AudioModule {
  const klass = moduleClassFromType(type);

  return new klass(name, code, props);
}

export function moduleClassFromType(type: string) {
  switch (type) {
    case ModuleType.Oscillator:
      return Oscillator;
    case ModuleType.Envelope:
      return Envelope;
    case ModuleType.AmpEnvelope:
      return AmpEnvelope;
    case ModuleType.FreqEnvelope:
      return FreqEnvelope;
    case ModuleType.Filter:
      return Filter;
    case ModuleType.Volume:
      return Volume;
    case PolyModuleType.Oscillator:
      return PolyOscillator;
    case PolyModuleType.Envelope:
      return PolyEnvelope;
    case PolyModuleType.AmpEnvelope:
      return PolyAmpEnvelope;
    case PolyModuleType.FreqEnvelope:
      return PolyFreqEnvelope;
    case PolyModuleType.Filter:
      return PolyFilter;
    case PolyModuleType.Volume:
      return PolyVolume;
    case ModuleType.Master:
      return Master;
    case ModuleType.Voice:
      return Voice;
    case PolyModuleType.VoiceScheduler:
      return VoiceScheduler;
    case ModuleType.MidiSelector:
      return MidiSelector;
    default:
      throw Error("Unknown module type");
  }
}
