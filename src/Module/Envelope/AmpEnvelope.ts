import { AmplitudeEnvelope } from "tone";

import { ModuleType } from "../index";
import Base, { EnvelopeInterface, PolyBase } from "./Base";
import { PolyModuleType } from "../PolyModule";

export default class AmpEnvelope extends Base<AmplitudeEnvelope> {
  constructor(name: string, props: EnvelopeInterface) {
    super(name, ModuleType.AmpEnvelope, new AmplitudeEnvelope(), props);
  }
}

export class PolyAmpEnvelope extends PolyBase<AmpEnvelope> {
  constructor(name: string, props: Partial<EnvelopeInterface>) {
    super(name, ModuleType.AmpEnvelope, PolyModuleType.AmpEnvelope, props);
  }
}
