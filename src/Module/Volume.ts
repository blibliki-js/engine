import { Volume as Vol } from "tone";

import Module, { ModuleType } from "../Module";
import PolyModule, { PolyModuleType } from "./PolyModule";

export interface VolumeInterface {
  volume: number;
  voiceNo?: number;
}

const InitialProps: VolumeInterface = {
  volume: -100,
};

export default class Volume extends Module<Vol, VolumeInterface> {
  constructor(name: string, props: Partial<VolumeInterface>) {
    super(new Vol(), {
      name,
      props: { ...InitialProps, ...props },
      type: ModuleType.Volume,
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

export class PolyVolume extends PolyModule<Volume, VolumeInterface> {
  constructor(name: string, props: Partial<VolumeInterface>) {
    super(PolyModuleType.Volume, {
      name,
      props: { ...InitialProps, ...props },
      type: ModuleType.Volume,
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
  }
}
