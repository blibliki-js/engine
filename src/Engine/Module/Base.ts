import { v4 as uuidv4 } from "uuid";

import { Input, Output, IOInterface } from "./IO";

export enum ModuleType {
  Oscillator = "oscillator",
  Envelope = "envelope",
  AmpEnvelope = "ampEnvelope",
  FreqEnvelope = "freqEnvelope",
  Filter = "filter",
}

export interface Connectable {
  connect: Function;
  chain: Function;
  toDestination: Function;
  dispose: Function;
}

export interface Triggerable {
  triggerAttack: Function;
  triggerRelease: Function;
}

export interface ModuleInterface {
  name: string;
  code: string;
  type: ModuleType;
  props?: any;
}

class Module<InternalModule extends Connectable, PropsInterface>
  implements ModuleInterface
{
  protected internalModule: InternalModule;

  id: string;
  name: string;
  code: string;
  inputs: Input[] = [];
  outputs: Output[] = [];
  type: ModuleType;
  _props: PropsInterface;

  constructor(internalModule: InternalModule, props: Partial<ModuleInterface>) {
    this.internalModule = internalModule;
    this.id = uuidv4();

    Object.assign(this, props);
  }

  set props(value: PropsInterface) {
    if (!value) return;
    if (!this._props) this._props = value;

    Object.assign(this, value);
  }

  get props() {
    return this._props;
  }

  plug(audioModule: Module<Connectable, any>, from: string, to: string) {
    const output = this.outputs.find((i) => i.name === from);
    const input = audioModule.inputs.find((i) => i.name === to);

    if (!output) throw Error(`Output ${from} not exist`);
    if (!input) throw Error(`Input ${to} not exist`);

    output.plug(input);
  }

  toDestination() {
    this.internalModule.toDestination();
  }

  dispose() {
    this.internalModule.dispose();
  }

  isTriggerable() {
    return !!(this as unknown as Triggerable).triggerAttack;
  }

  serialize() {
    return {
      name: this.name,
      code: this.code,
      type: this.type,
      props: this.props,
      inputs: this.inputs.map((i) => i.serialize()),
      outputs: this.outputs.map((i) => i.serialize()),
    };
  }

  protected connect(pluggable: any) {
    this.internalModule.connect(pluggable);
  }

  protected registerInput(props: IOInterface) {
    this.inputs.push(new Input(this, props));
  }

  protected registerOutput(props: IOInterface) {
    this.outputs.push(new Output(this, props));
  }
}

export default Module;
