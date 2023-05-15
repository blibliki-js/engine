import { Volume as Vol } from "tone";

import Module, { Voicable } from "./Base";
import PolyModule from "./PolyModule";
import Note from "../Note";

export interface VolumeInterface extends Voicable {
  volume: number;
}

const InitialProps: VolumeInterface = {
  volume: -Infinity,
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

  triggerAttack = (note: Note, triggeredAt: number) => {
    const db = 20 * Math.log10(note.velocity);
    this.internalModule.volume.exponentialRampToValueAtTime(db, triggeredAt);
  };

  triggerRelease = (note: Note, triggeredAt: number) => {
    // Do nothing
  };
}

export default class Volume extends PolyModule<MonoVolume, VolumeInterface> {
  static moduleName = "Volume";

  constructor(name: string, props: Partial<VolumeInterface>) {
    super({
      name,
      child: MonoVolume,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
    this.registerInputs();
  }

  private registerInputs() {
    this.registerInput({
      name: "midi in",
      pluggable: this.midiTriggered,
    });
  }
}
