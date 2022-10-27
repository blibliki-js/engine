import { AmplitudeEnvelope } from "tone";

import Base, { EnvelopeInterface, PolyBase } from "./Base";

class MonoAmpEnvelope extends Base<AmplitudeEnvelope> {
  constructor(name: string, props: EnvelopeInterface) {
    super(name, new AmplitudeEnvelope(), props);
  }
}

export default class AmpEnvelope extends PolyBase<MonoAmpEnvelope> {
  static moduleName = "AmpEnvelope";

  constructor(name: string, props: Partial<EnvelopeInterface>) {
    super(name, MonoAmpEnvelope, props);
  }
}
