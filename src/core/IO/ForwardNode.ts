import IONode, { IOType, IIONode } from "./Node";
import Module, { Connectable, PolyModule } from "../../Module";
import { AnyObject } from "../../types";

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

  plug(io: ForwardOutput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: ForwardOutput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  checkNameValidity() {
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

  plug(io: ForwardInput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: ForwardInput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  checkNameValidity() {
    const output = this.plugableModule.audioModules[0].outputs.findByName(
      this.name
    );

    if (!output) throw Error("You should forward to existing output");
  }
}
