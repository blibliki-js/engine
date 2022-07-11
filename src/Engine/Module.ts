import { v4 as uuidv4 } from "uuid";

export enum ModuleType {
  Oscillator = "oscillator",
  Envelope = "envelope",
  AmpEnvelope = "ampEnvelope",
  FreqEnvelope = "freqEnvelope",
  Filter = "filter",
}

interface ModuleInterface {
  name: string;
  code: string;
  type: ModuleType;
}

class Module<InternalModule extends Connectable> implements ModuleInterface {
  protected internalModule: InternalModule;

  id: string;
  name: string;
  code: string;
  type: ModuleType;

  constructor(internalModule: InternalModule, props: ModuleInterface) {
    Object.assign(this, props);

    this.internalModule = internalModule;
    this.id = uuidv4();
  }

  connect(module: Module<InternalModule>) {
    this.internalModule.connect(module.internalModule);
  }

  chain(...modules: Module<InternalModule>[]) {
    this.internalModule.chain(
      ...modules.map((m: Module<InternalModule>) => m.internalModule)
    );
  }

  toDestination() {
    this.internalModule.toDestination();
  }
}

export interface Connectable {
  connect: Function;
  chain: Function;
  toDestination: Function;
}

export default Module;
