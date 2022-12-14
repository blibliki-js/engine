import { Destination, getDestination } from "tone";
import Module from "./Base";

export interface MasterInterface {}

export default class Master extends Module<
  typeof Destination,
  MasterInterface
> {
  static moduleName = "Master";

  constructor() {
    super(getDestination(), {
      name: "Master",
    });

    this.registerBasicInputs();
  }
}
