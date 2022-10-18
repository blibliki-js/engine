import { Context, setContext } from "tone";

import { ModuleType } from "./Module";
import { AudioModule, createModule } from "./Module";
import Master from "./Module/Master";
import { applyRoutes, createRoute, RouteInterface, RouteProps } from "./routes";

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
  private context: Context;

  modules: {
    [Identifier: string]: AudioModule;
  };

  routes: {
    [Identifier: string]: RouteInterface;
  };

  private constructor() {
    this.modules = {};
    this.routes = {};
  }

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  initialize(props: InitializeInterface) {
    this.context = new Context(props.context);
    setContext(this.context);
    this.context.transport.start();

    return {
      master: this.master,
    };
  }

  registerModule(name: string, type: string, props: any = {}) {
    const audioModule = createModule(name, type, props);
    this.modules[audioModule.id] = audioModule;

    applyRoutes(Object.values(this.routes));

    return audioModule.serialize();
  }

  updateNameModule(id: string, name: string) {
    const audioModule = this.findById(id);
    audioModule.name = name;

    return audioModule.serialize();
  }

  updatePropsModule(id: string, props: any) {
    const audioModule = this.findById(id);
    audioModule.props = props;

    return audioModule.serialize();
  }

  addRoute(props: RouteProps) {
    const route = createRoute(props);
    this.routes[route.id] = route;

    applyRoutes(Object.values(this.routes));

    return route;
  }

  removeRoute(route: RouteInterface) {
    delete this.routes[route.id];
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
