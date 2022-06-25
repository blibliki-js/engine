import { v4 as uuidv4 } from "uuid";

export enum ModuleType {
  Oscillator = "oscillator",
  Envelope = "envelope",
}

interface ModuleInterface {
  name: string;
  type: ModuleType;
}

class Module {
  id: string;
  internalModule: any;

  constructor(props: ModuleInterface) {
    Object.assign(this, props);
    this.id = uuidv4();
    console.log(`id: ${this.id}, name: ${this.name}`);
  }

  connect(module: Module) {
    throw Error("Not implemented");
  }

  chain(modules: [Module]) {
    throw Error("Not implemented");
  }

  toDestination() {
    throw Error("Not implemented");
  }
}

interface Module extends ModuleInterface {}

export default Module;
