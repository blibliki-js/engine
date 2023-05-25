import { Signal } from "tone";
import Module, { Connectable } from "./Base";

interface EffectLike extends Connectable {
  wet: Signal<"normalRange">;
}

export interface EffectInterface {
  wet: number;
}

const InitialProps: EffectInterface = {
  wet: 1,
};

export default abstract class Effect<
  InternalEffect extends EffectLike,
  ModuleInterface extends EffectInterface
> extends Module<InternalEffect, ModuleInterface> {
  constructor(
    name: string,
    internalModule: InternalEffect,
    props: Partial<ModuleInterface>
  ) {
    super(internalModule, {
      name,
      props: { ...InitialProps, ...props } as ModuleInterface,
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
  }

  get wet() {
    return this._props["wet"];
  }

  set wet(value: number) {
    this._props = { ...this.props, wet: value };
    this.internalModule.wet.value = this.wet;
  }
}
