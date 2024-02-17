import { AmplitudeEnvelope } from "tone";

import Base, { EnvelopeInterface, PolyBase } from "./Base";

class MonoAmpEnvelope extends Base<AmplitudeEnvelope> {
  constructor(params: { id?: string; name: string; props: EnvelopeInterface }) {
    const { id, name, props } = params;
    super({ id, name, internalModule: new AmplitudeEnvelope(), props });
  }
}

export default class AmpEnvelope extends PolyBase<MonoAmpEnvelope> {
  static moduleName = "AmpEnvelope";

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<EnvelopeInterface>;
  }) {
    const { id, name, props } = params;
    super({ id, name, child: MonoAmpEnvelope, props });
  }
}
