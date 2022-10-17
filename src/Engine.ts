import { Transport, Context, setContext } from "tone";

import { ModuleType } from "./Module";
import { AudioModule, createModule } from "./Module";
import Master from "./Module/Master";
import { applyRoutes } from "./routes";

type LatencyHint = "interactive" | "playback" | "balanced";

interface ContextInterface {
  latencyHint: LatencyHint;
  lookAhead: number;
}

interface InitializeInterface {
  context?: Partial<ContextInterface>;
}

class Engine {
  private static instance: Engine;
  private _master: Master;

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

  initialize(props: InitializeInterface) {
    const context = new Context(props.context);
    setContext(context);
    Transport.start();

    return {
      master: this.master,
    };
  }

  registerModule(name: string, type: string, props: any = {}) {
    const audioModule = createModule(name, type, props);
    this.modules[audioModule.id] = audioModule;

    //applyRoutes();

    return audioModule.serialize();
  }

  updatePropsModule(id: string, props: any) {
    const audioModule = this.findById(id);
    audioModule.props = props;

    return audioModule.serialize();
  }

  get master() {
    if (this._master) return this._master.serialize();

    const masterProps = this.registerModule(
      "Master",
      "master",
      ModuleType.Master
    );
    this._master = this.modules[masterProps.id] as Master;

    return masterProps;
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
}

export default Engine.getInstance();
