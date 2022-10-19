import { Destination, getDestination } from "tone";
import Module, { ModuleType } from "../Module";

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

    this.registerBasicInputs();
  }
}
