import { AmplitudeEnvelope } from "tone";

import { ModuleType } from "Engine/Module";
import Base, { EnvelopeInterface } from "./Base";
import PolyModule, { PolyModuleType } from "../PolyModule";

export default class AmpEnvelope extends Base<AmplitudeEnvelope> {
  constructor(name: string, code: string, props: EnvelopeInterface) {
    super(name, code, ModuleType.AmpEnvelope, new AmplitudeEnvelope(), props);
  }
}

export class PolyAmpEnvelope extends PolyModule<EnvelopeInterface> {
  constructor(name: string, code: string, props: Partial<EnvelopeInterface>) {
    super(PolyModuleType.AmpEnvelope, {
      name,
      code,
      props,
      type: ModuleType.AmpEnvelope,
    });
  }
}
