import { Volume as Vol } from "tone";

import Module, { Voicable } from "./Base";
import PolyModule from "./PolyModule";

export interface VolumeInterface extends Voicable {
  volume: number;
}

const InitialProps: VolumeInterface = {
  volume: -100,
};

class MonoVolume extends Module<Vol, VolumeInterface> {
  constructor(name: string, props: Partial<VolumeInterface>) {
    super(new Vol(), {
      name,
      props: { ...InitialProps, ...props },
    });
  }

  get volume() {
    return this._props["volume"];
  }

  set volume(value: number) {
    this._props = { ...this.props, volume: value };

    this.internalModule.volume.value = this.volume;
  }
}

export default class Volume extends PolyModule<MonoVolume, VolumeInterface> {
  constructor(name: string, props: Partial<VolumeInterface>) {
    super({
      name,
      child: MonoVolume,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
  }
}
