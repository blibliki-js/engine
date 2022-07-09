import { AmplitudeEnvelope as Envelope } from "tone";

import Base from "./Base";

export default class AmpEnvelope extends Base {
  constructor(name: string) {
    super(name, Envelope);
  }
}
