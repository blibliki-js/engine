import { ModuleType } from "./Base";
import Oscillator from "./Oscillator";
import { Envelope, AmpEnvelope, FreqEnvelope } from "./Envelope";
import Filter from "./Filter";

export { default, ModuleType } from "./Base";
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
  let klass;

  switch (type) {
    case ModuleType.Oscillator:
      klass = Oscillator;
      break;
    case ModuleType.Envelope:
      klass = Envelope;
      break;
    case ModuleType.AmpEnvelope:
      klass = AmpEnvelope;
      break;
    case ModuleType.FreqEnvelope:
      klass = FreqEnvelope;
      break;
    case ModuleType.Filter:
      klass = Filter;
      break;
    default:
      throw Error("Unknown module type");
  }

  return new klass(name, code, props);
}
