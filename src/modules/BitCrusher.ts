import { BitCrusher as InternalBitCrasher } from "tone";

import Effect, { EffectInterface } from "./Effect";

interface BitCrusherInterface extends EffectInterface {
  bits: number;
}

const InitialProps: Partial<BitCrusherInterface> = {
  bits: 16,
};

export default class BitCrusher extends Effect<
  InternalBitCrasher,
  BitCrusherInterface
> {
  static moduleName = "BitCrusher";

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<BitCrusherInterface>;
  }) {
    const { id, name, props } = params;

    super({
      id,
      name,
      internalModule: new InternalBitCrasher(),
      props: {
        ...InitialProps,
        ...props,
      },
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
