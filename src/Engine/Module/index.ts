import { ModuleType } from "./Base";
import { PolyModuleType } from "./PolyModule";
import Oscillator, { PolyOscillator } from "./Oscillator";
import { Envelope, AmpEnvelope, FreqEnvelope } from "./Envelope";
import Filter, { PolyFilter } from "./Filter";
import Master from "./Master";
import VoiceScheduler from "./VoiceScheduler";
import MidiSelector from "./MidiSelector";
import { PolyAmpEnvelope } from "./Envelope/AmpEnvelope";
import { PolyFreqEnvelope } from "./Envelope/FreqEnvelope";
import { PolyEnvelope } from "./Envelope/Base";

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

export function createModule(
  name: string,
  code: string,
  type: string,
  props: any
) {
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
    case ModuleType.Master:
      return Master;
    case ModuleType.VoiceScheduler:
      return VoiceScheduler;
    case ModuleType.MidiSelector:
      return MidiSelector;
    default:
      throw Error("Unknown module type");
  }
}

export function isPoly(type: string): boolean {
  return true;
}
