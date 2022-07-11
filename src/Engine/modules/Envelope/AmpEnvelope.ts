import { AmplitudeEnvelope } from "tone";

import { ModuleType } from "Engine/Module";
import Base from "./Base";

export default class AmpEnvelope extends Base<AmplitudeEnvelope> {
  constructor(name: string, code: string) {
    super(name, code, ModuleType.AmpEnvelope, new AmplitudeEnvelope());
  }
}
