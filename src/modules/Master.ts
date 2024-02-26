import { Destination, getDestination } from "tone";
import Module from "../core/Module";

export interface MasterInterface {}

export default class Master extends Module<
  typeof Destination,
  MasterInterface
> {
  static moduleName = "Master";

  constructor({ id }: { id?: string }) {
    super(getDestination(), {
      id,
      name: "Master",
    });

    this.registerAudioInput({
      name: "input",
      internalModule: this.internalModule,
    });
  }

  dispose(): void {
    this.inputs.unPlugAll();
    this.outputs.unPlugAll();
  }
}
