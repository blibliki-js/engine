import Module, { DummnyInternalModule, PolyModule } from "../src/core/Module";

interface IMonoMocking {}

export class MonoMocking extends Module<DummnyInternalModule, IMonoMocking> {
  constructor(name: string, props: Partial<IMonoMocking>) {
    super(new DummnyInternalModule(), {
      name,
      props,
    });
    this.registerDefaultMidiInput();
    this.registerMidiOutput({ name: "midi out" });
  }
}

export class PolyMocking extends PolyModule<MonoMocking, IMonoMocking> {
  constructor(name: string, props: Partial<IMonoMocking>) {
    super({
      name,
      child: MonoMocking,
      props,
    });

    this.registerInput({ name: "midi in" });
    this.registerOutput({ name: "midi out" });
  }
}
