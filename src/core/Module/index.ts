import Module, { Connectable } from "./MonoModule";
import PolyModule from "./PolyModule";

export { default, DummnyInternalModule } from "./MonoModule";
export { default as PolyModule } from "./PolyModule";
export type {
  ModuleInterface,
  Connectable,
  Triggerable,
  Startable,
  Voicable,
} from "./MonoModule";

export type AudioModule =
  | Module<Connectable, any>
  | PolyModule<Module<Connectable, any>, any>;
