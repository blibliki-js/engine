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
  static moduleName = "Distortion";

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<DistortionInterface>;
  }) {
    const { id, name, props } = params;

    super({
      id,
      name,
      internalModule: new InternalDistortion(),
      props: {
        ...InitialProps,
        ...props,
      },
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
