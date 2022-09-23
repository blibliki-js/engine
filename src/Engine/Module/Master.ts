import { Destination } from "tone";
import Module, { ModuleType } from "../Module";

export interface MasterInterface {}

export default class Master extends Module<
  typeof Destination,
  MasterInterface
> {
  static poly = false;

  constructor() {
    super(Destination, {
      name: "Master",
      code: "master",
      type: ModuleType.Master,
    });
    this.registerInputs();
  }

  private registerInputs() {
    this.registerInput({
      name: "input",
      pluggable: this.internalModule,
    });
  }
}
