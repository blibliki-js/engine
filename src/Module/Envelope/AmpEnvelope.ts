import { AmplitudeEnvelope } from "tone";

import { ModuleType } from "Module";
import Base, { EnvelopeInterface, PolyBase } from "./Base";
import { PolyModuleType } from "../PolyModule";

export default class AmpEnvelope extends Base<AmplitudeEnvelope> {
  constructor(name: string, code: string, props: EnvelopeInterface) {
    super(name, code, ModuleType.AmpEnvelope, new AmplitudeEnvelope(), props);
  }
}

export class PolyAmpEnvelope extends PolyBase<AmpEnvelope> {
  constructor(name: string, code: string, props: Partial<EnvelopeInterface>) {
    super(
      name,
      code,
      ModuleType.AmpEnvelope,
      PolyModuleType.AmpEnvelope,
      props
    );
  }
}
