import { Distortion as InternalDistortion } from "tone";

import Effect, { EffectInterface } from "./Effect";

interface DistortionInterface extends EffectInterface {
  drive: number;
}

const InitialProps: Partial<DistortionInterface> = {
  drive: 0.3,
};

export default class Distortion extends Effect<
  InternalDistortion,
  DistortionInterface
> {
  constructor(name: string, props: Partial<DistortionInterface>) {
    super(name, new InternalDistortion(), {
      ...InitialProps,
      ...props,
    });
  }

  get drive() {
    return this._props["drive"];
  }

  set drive(value: number) {
    this._props = { ...this.props, drive: value };
    this.internalModule.distortion = this.drive;
  }
}
