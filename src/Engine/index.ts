import { store } from "store";
import { AudioModule, ModuleType, createModule } from "Engine/Module";
import { addModule } from "Engine/Module/modulesSlice";
import { applyRoutes } from "./routes";

class Engine {
  private static instance: Engine;
  modules: {
    [Identifier: string]: AudioModule;
  };

  private constructor() {
    this.modules = {};
  }

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  initialize() {
    this.regeisterMaster();
  }

  registerModule(name: string, code: string, type: string, props: any = {}) {
    const audioModule = createModule(name, code, type, props);
    this.modules[audioModule.id] = audioModule;

    applyRoutes();

    return audioModule.serialize();
  }

  updatePropsModule(id: string, props: any) {
    const audioModule = this.findById(id);
    audioModule.props = props;

    return audioModule.serialize();
  }

  triggerKey(noteName: string, type: string) {}

  dispose() {
    Object.values(this.modules).forEach((m) => m.dispose());
    this.modules = {};
  }

  findById(id: string): AudioModule {
    const audioModule = this.modules[id];

    if (!audioModule) throw Error(`Audio module with id ${id} not exists`);

    return audioModule;
  }

  findByCode(code: string): AudioModule | null {
    const audioModule = Object.values(this.modules).find(
      (modula) => modula.code === code
    );

    if (!audioModule) return null;

    return audioModule;
  }

  private regeisterMaster() {
    store.dispatch(
      addModule({ name: "Master", code: "master", type: ModuleType.Master })
    );
  }
}

export default Engine.getInstance();
