import { BitCrusher as InternalBitCrasher } from "tone";

import { ModuleType } from "./Base";
import Effect, { EffectInterface } from "./Effect";

interface BitCrusherInterface extends EffectInterface {
  bits: number;
}

const InitialProps: Partial<BitCrusherInterface> = {
  bits: 16,
};

export default class Delay extends Effect<
  InternalBitCrasher,
  BitCrusherInterface
> {
  constructor(name: string, props: Partial<BitCrusherInterface>) {
    super(name, ModuleType.BitCrusher, new InternalBitCrasher(), {
      ...InitialProps,
      ...props,
    });
  }

  get bits() {
    return this._props["bits"];
  }

  set bits(value: number) {
    this._props = { ...this.props, bits: value };
    this.internalModule.bits.value = this.bits;
  }
}
