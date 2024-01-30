import IONode, {
  IOType,
  IIONode,
  plugCompatibleIO,
  unPlugCompatibleIO,
} from "./Node";
import Module, { Connectable, PolyModule } from "../Module";
import { AnyObject } from "../../types";
import { AnyInput, AnyOuput } from ".";

export interface IForwardInput extends IIONode {
  ioType: IOType.ForwardInput;
}
export interface IForwardOutput extends IIONode {
  ioType: IOType.ForwardOutput;
}

export class ForwardInput extends IONode implements IForwardInput {
  declare plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>;
  declare ioType: IOType.ForwardInput;
  declare connections: ForwardOutput[];

  constructor(
    plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>,
    props: IForwardInput
  ) {
    super(plugableModule, props);
    this.checkNameValidity();
  }

  get subInputs() {
    return this.plugableModule.audioModules.map((am) => {
      const input = am.inputs.findByName(this.name);
      if (!input) throw Error(`Could not forward input ${this.name}`);

      return input;
    });
  }

  get subModules() {
    return this.plugableModule.audioModules;
  }

  subModule(voiceNo: number) {
    const mod = this.subModules.find((m) => m.voiceNo === voiceNo);
    if (!mod) throw Error(`Submodule with voiceNo ${voiceNo} not found`);

    return mod;
  }

  subInput(voiceNo: number) {
    const input = this.subModule(voiceNo).inputs.findByName(this.name);
    if (!input) throw Error(`Could not forward input ${this.name}`);

    return input;
  }

  plug(io: AnyOuput, plugOther: boolean = true) {
    super.plug(io, plugOther);
    if (!plugOther && io instanceof ForwardOutput) return;

    if (io instanceof ForwardOutput) {
      this.subModules.forEach((am) => {
        const input = am.inputs.findByName(this.name);
        if (!input) throw Error(`Could not forward input ${this.name}`);

        const output = io.subOutput(am.voiceNo as number);
        plugCompatibleIO(input, output);
      });
    } else {
      this.subInputs.forEach((input) => plugCompatibleIO(input, io));
    }
  }

  unPlug(io: AnyOuput, plugOther: boolean = true) {
    super.unPlug(io, plugOther);
    if (!plugOther && io instanceof ForwardOutput) return;

    if (io instanceof ForwardOutput) {
      this.subModules.forEach((am) => {
        const input = am.inputs.findByName(this.name);
        if (!input) throw Error(`Could not forward input ${this.name}`);

        const output = io.subOutput(am.voiceNo as number);
        unPlugCompatibleIO(input, output);
      });
    } else {
      this.subInputs.forEach((input) => unPlugCompatibleIO(input, io));
    }
  }

  unPlugAll() {
    IONode.unPlugAll(this);
  }

  private checkNameValidity() {
    const input = this.plugableModule.audioModules[0].inputs.findByName(
      this.name
    );

    if (!input) throw Error("You should forward to existing input");
  }
}

export class ForwardOutput extends IONode implements IForwardOutput {
  declare plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>;
  declare ioType: IOType.ForwardOutput;
  declare connections: ForwardInput[];

  constructor(
    plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>,
    props: IForwardOutput
  ) {
    super(plugableModule, props);
    this.checkNameValidity();
  }

  get subOutputs() {
    return this.subModules.map((am) => {
      const output = am.outputs.findByName(this.name);
      if (!output) throw Error(`Could not forward input ${this.name}`);

      return output;
    });
  }

  get subModules() {
    return this.plugableModule.audioModules;
  }

  subModule(voiceNo: number) {
    const mod = this.subModules.find((m) => m.voiceNo === voiceNo);
    if (!mod) throw Error(`Submodule with voiceNo ${voiceNo} not found`);

    return mod;
  }

  subOutput(voiceNo: number) {
    const output = this.subModule(voiceNo).outputs.findByName(this.name);
    if (!output) throw Error(`Could not forward input ${this.name}`);

    return output;
  }

  plug(io: AnyInput, plugOther: boolean = true) {
    super.plug(io, plugOther);
    if (!plugOther && io instanceof ForwardInput) return;

    if (io instanceof ForwardInput) {
      this.subModules.forEach((am) => {
        const output = am.outputs.findByName(this.name);
        if (!output) throw Error(`Could not forward output ${this.name}`);

        const input = io.subInput(am.voiceNo as number);

        plugCompatibleIO(input, output);
      });
    } else {
      this.subOutputs.forEach((output) => plugCompatibleIO(io, output));
    }
  }

  unPlug(io: AnyInput, plugOther: boolean = true) {
    super.unPlug(io, plugOther);
    if (!plugOther && io instanceof ForwardInput) return;

    if (io instanceof ForwardInput) {
      this.subModules.forEach((am) => {
        const output = am.outputs.findByName(this.name);
        if (!output) throw Error(`Could not forward output ${this.name}`);

        const input = io.subInput(am.voiceNo as number);

        unPlugCompatibleIO(input, output);
      });
    } else {
      this.subOutputs.forEach((output) => unPlugCompatibleIO(io, output));
    }
  }

  unPlugAll() {
    IONode.unPlugAll(this);
  }

  private checkNameValidity() {
    const output = this.plugableModule.audioModules[0].outputs.findByName(
      this.name
    );

    if (!output) throw Error("You should forward to existing output");
  }
}
