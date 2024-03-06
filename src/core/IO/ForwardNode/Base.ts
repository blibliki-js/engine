import IONode, { IIONode, plugCompatibleIO, unPlugCompatibleIO } from "../Node";

import Module, { Connectable, PolyModule } from "../../Module";
import { AnyObject } from "../../../types";
import { AnyIO, ForwardAudioInput, ForwardAudioOutput } from "..";

export default class ForwardBaseNode extends IONode {
  declare plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>;

  constructor(
    plugableModule: PolyModule<Module<Connectable, AnyObject>, AnyObject>,
    props: IIONode
  ) {
    super(plugableModule, props);
    this.checkNameValidity();
  }

  get voices() {
    return this.subModules.length;
  }

  get subModules() {
    return this.plugableModule.audioModules;
  }

  subModule(voiceNo: number) {
    const adjustedVoiceNo = voiceNo % this.voices;
    const mod = this.subModules.find((m) => m.voiceNo === adjustedVoiceNo);
    if (!mod) throw Error(`Submodule with voiceNo ${voiceNo} not found`);

    return mod;
  }

  get subIOs() {
    const ios: IONode[] = [];

    for (let voice = 0; voice < this.voices; voice++) {
      ios.push(this.subIO(voice));
    }

    return ios;
  }

  subIO(voiceNo: number) {
    const ios = this.ioType.includes("Input")
      ? this.subModule(voiceNo).inputs
      : this.subModule(voiceNo).outputs;

    const io = ios.findByName(this.name);
    if (!io) throw Error(`Could not forward io ${this.name}`);

    return io;
  }

  plug(io: AnyIO, plugOther: boolean = true) {
    this.plugUnplug(io, plugOther, true);
  }

  unPlug(io: AnyIO, plugOther: boolean = true) {
    this.plugUnplug(io, plugOther, false);
  }

  unPlugAll() {
    IONode.unPlugAll(this);
  }

  private plugUnplug(io: AnyIO, plugOther: boolean, isPlug: boolean) {
    isPlug ? super.plug(io, plugOther) : super.unPlug(io, plugOther);
    if (
      !plugOther &&
      (io instanceof ForwardAudioOutput || io instanceof ForwardAudioInput)
    )
      return;

    const plugCallback = isPlug ? plugCompatibleIO : unPlugCompatibleIO;

    if (io instanceof ForwardAudioOutput || io instanceof ForwardAudioInput) {
      const maxVoices = Math.max(this.voices, io.voices);

      for (let voice = 0; voice < maxVoices; voice++) {
        const thisIO = this.subIO(voice);
        const otherIO = io.subIO(voice);

        plugCallback(thisIO, otherIO);
      }
    } else {
      for (let voice = 0; voice < this.voices; voice++) {
        const thisIO = this.subIO(voice);
        plugCallback(thisIO, io);
      }
    }
  }

  private checkNameValidity() {
    const io = this.subIO(0);

    if (!io) throw Error("You should forward to existing input");
  }
}
