import { IOType, IIONode } from "../Node";
import Module, { Connectable, PolyModule } from "../../Module";
import { AnyObject } from "../../../types";
import { AnyAudioInput, AnyAudioOuput, AnyInput, AnyOuput } from "..";
import ForwardBaseNode from "./Base";

export interface IForwardAudioInput extends IIONode {
  ioType: IOType.ForwardAudioInput;
}
export interface IForwardAudioOutput extends IIONode {
  ioType: IOType.ForwardAudioOutput;
}

export class ForwardAudioInput
  extends ForwardBaseNode
  implements IForwardAudioInput
{
  declare plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>;
  declare ioType: IOType.ForwardAudioInput;
  declare connections: AnyAudioOuput[];

  constructor(
    plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>,
    props: IForwardAudioInput
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

export class ForwardAudioOutput
  extends ForwardBaseNode
  implements IForwardAudioOutput
{
  declare plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>;
  declare ioType: IOType.ForwardAudioOutput;
  declare connections: AnyAudioInput[];

  constructor(
    plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>,
    props: IForwardAudioOutput
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
