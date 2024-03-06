import { IOType, IIONode } from "../Node";
import Module, { Connectable, PolyModule } from "../../Module";
import { AnyObject } from "../../../types";
import { AnyInput, AnyOuput } from "..";
import ForwardBaseNode from "./Base";

export interface IForwardInput extends IIONode {
  ioType: IOType.ForwardInput;
}
export interface IForwardOutput extends IIONode {
  ioType: IOType.ForwardOutput;
}

export class ForwardInput extends ForwardBaseNode implements IForwardInput {
  declare plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>;
  declare ioType: IOType.ForwardInput;
  declare connections: ForwardOutput[];

  constructor(
    plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>,
    props: IForwardInput
  ) {
    super(plugableModule, props);
  }

  plug(io: AnyOuput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: AnyOuput, plugOther: boolean = true) {
    super.unPlug(io, plugOther);
  }
}

export class ForwardOutput extends ForwardBaseNode implements IForwardOutput {
  declare plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>;
  declare ioType: IOType.ForwardOutput;
  declare connections: ForwardInput[];

  constructor(
    plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>,
    props: IForwardOutput
  ) {
    super(plugableModule, props);
  }

  plug(io: AnyInput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: AnyInput, plugOther: boolean = true) {
    super.unPlug(io, plugOther);
  }
}
