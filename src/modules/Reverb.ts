import { Reverb as InternalReverb } from "tone";

import Effect, { EffectInterface } from "./Effect";

interface ReverbInterface extends EffectInterface {
  decay: number;
  preDelay: number;
}

const InitialProps: Partial<ReverbInterface> = {
  decay: 1.5,
  preDelay: 0.025,
};

export default class Reverb extends Effect<InternalReverb, ReverbInterface> {
  static moduleName = "Reverb";

  constructor(name: string, props: Partial<ReverbInterface>) {
    super(name, new InternalReverb(), {
      ...InitialProps,
      ...props,
    });
  }

  get decay() {
    return this._props["decay"];
  }

  set decay(value: number) {
    this._props = { ...this.props, decay: value };
    this.internalModule.decay = this.decay;
  }

  get preDelay() {
    return this._props["preDelay"];
  }

  set preDelay(value: number) {
    this._props = { ...this.props, preDelay: value };
    this.internalModule.preDelay = this.preDelay;
  }
}
