import { Volume as Vol } from "tone";

import Module, { PolyModule } from "../core/Module";
import Note from "../core/Note";

export interface VolumeInterface {
  volume: number;
}

const InitialProps: VolumeInterface = {
  volume: -Infinity,
};

class MonoVolume extends Module<Vol, VolumeInterface> {
  constructor(params: {
    id?: string;
    name: string;
    props: Partial<VolumeInterface>;
  }) {
    const { id, name, props } = params;

    super(new Vol(), {
      id,
      name,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
  }

  get volume() {
    return this._props["volume"];
  }

  set volume(value: number) {
    this._props = { ...this.props, volume: value };

    this.internalModule.volume.value = this.volume;
  }

  triggerAttack = (note: Note, triggeredAt: number) => {
    const db = 20 * Math.log10(note.velocity);
    this.internalModule.volume.exponentialRampToValueAtTime(db, triggeredAt);
  };

  triggerRelease = () => {
    // Do nothing
  };
}

export default class Volume extends PolyModule<MonoVolume, VolumeInterface> {
  static moduleName = "Volume";

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<VolumeInterface>;
  }) {
    const { id, name, props } = params;

    super({
      id,
      name,
      child: MonoVolume,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
  }
}
