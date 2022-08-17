import { AmplitudeEnvelope } from "tone";

import { ModuleType } from "Engine/Module";
import Base, { EnvelopeInterface } from "./Base";

export default class AmpEnvelope extends Base<AmplitudeEnvelope> {
  constructor(name: string, code: string, props: EnvelopeInterface) {
    super(name, code, ModuleType.AmpEnvelope, new AmplitudeEnvelope(), props);
  }
}
