import Module, { DummnyInternalModule, PolyModule } from "../src/core/Module";

interface IMonoMocking {}

export class MonoMocking extends Module<DummnyInternalModule, IMonoMocking> {
  constructor(params: { name: string; props: Partial<IMonoMocking> }) {
    const { name, props } = params;
    super(new DummnyInternalModule(), {
      name,
      props,
    });
    this.registerDefaultMidiInput();
    this.registerMidiOutput({ name: "midi out" });
  }
}

export class PolyMocking extends PolyModule<MonoMocking, IMonoMocking> {
  constructor(params: { name: string; props: Partial<IMonoMocking> }) {
    const { name, props } = params;
    super({
      name,
      child: MonoMocking,
      props,
    });

    this.registerInput({ name: "midi in" });
    this.registerOutput({ name: "midi out" });
  }
}
