import Module, { PolyModule } from "../src/core/Module";

interface IMonoMocking {}

export class MockInternalModule {
  connect() {}
  disconnect() {}
  dispose() {}
}

export class MonoMocking extends Module<MockInternalModule, IMonoMocking> {
  constructor(params: { name: string; props: Partial<IMonoMocking> }) {
    const { name, props } = params;
    super(new MockInternalModule(), {
      name,
      props,
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
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

    this.registerBasicInputs();
    this.registerBasicOutputs();
  }
}
