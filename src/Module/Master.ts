import { Destination, getDestination } from "tone";
import Module, { ModuleType } from "../Module";
import { Output } from "./IO";

export interface MasterInterface {}

export default class Master extends Module<
  typeof Destination,
  MasterInterface
> {
  constructor() {
    super(getDestination(), {
      name: "Master",
      type: ModuleType.Master,
    });
    this.registerInputs();
  }

  private registerInputs() {
    this.registerInput({
      name: "input",
      onPlug: (output: Output) => {
        output.pluggable(this.internalModule);
      },
    });
  }
}
