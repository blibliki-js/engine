import { v4 as uuidv4 } from "uuid";
import { createModule } from ".";
import Module, { ModuleInterface, ModuleType, Connectable } from "./Base";

export enum PolyModuleType {
  Oscillator = "oscillator",
  Envelope = "envelope",
  AmpEnvelope = "ampEnvelope",
  FreqEnvelope = "freqEnvelope",
  Filter = "filter",
}

interface PolyModuleInterface extends ModuleInterface {}

export default abstract class PolyModule<PropsInterface> {
  readonly id: string;
  name: string;
  code: string;
  audioModules: Module<Connectable, any>[];
  readonly _type: PolyModuleType;
  readonly childrenType: ModuleType;
  private _numberOfVoices: number;

  constructor(type: PolyModuleType, props: PolyModuleInterface) {
    this.id = uuidv4();
    this._type = type;
    this.childrenType = props.type;
    this.audioModules = [];

    const { props: extraProps, ...basicProps } = props;
    Object.assign(this, basicProps);

    this.numberOfVoices = 6;

    Object.assign(this, { props: extraProps });
  }

  get type() {
    return this._type;
  }

  // Do nothing
  // This is a little hack to avoid override type by children module
  set type(value: PolyModuleType) {}

  get props() {
    if (this.audioModules.length === 0) {
      throw Error("There isn't any initialized module");
    }

    return this.audioModules[0].props;
  }

  set props(value: PropsInterface) {
    this.audioModules.forEach((m) => (m.props = value));
  }

  get numberOfVoices() {
    return this._numberOfVoices;
  }

  set numberOfVoices(value: number) {
    this._numberOfVoices = value;
    this.adjustNumberOfModules();
  }

  plug(
    audioModule: Module<Connectable, any> | PolyModule<any>,
    from: string,
    to: string
  ) {
    return this.audioModules.forEach((m) => m.plug(audioModule, from, to));
  }

  unplugAll() {
    this.audioModules.forEach((m) => {
      m.outputs.forEach((o) => o.unPlugAll());
    });
  }

  dispose() {
    this.audioModules.forEach((m) => {
      m.dispose();
    });
  }

  serialize() {
    if (this.audioModules.length === 0)
      throw Error("There isn't any initialized module");

    return {
      ...this.audioModules[0].serialize(),
      id: this.id,
      type: this.type,
    };
  }

  private adjustNumberOfModules() {
    if (this.audioModules.length === this.numberOfVoices) return;

    if (this.audioModules.length > this.numberOfVoices) {
      const audioModule = this.audioModules.pop();
      audioModule?.dispose();
    } else {
      const props = this.audioModules.length ? this.props : {};
      const audioModule = createModule(
        this.name,
        this.code,
        this.childrenType,
        { ...props, voiceNo: this.audioModules.length }
      );

      if (audioModule instanceof PolyModule)
        throw Error("Polymodule not supported");

      this.audioModules.push(audioModule);
    }

    this.adjustNumberOfModules();
  }
}
