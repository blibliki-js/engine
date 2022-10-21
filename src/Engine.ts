import { Context, setContext } from "tone";
import MidiDeviceManager from "./MidiDeviceManager";
import MidiEvent from "./MidiEvent";

import { ModuleType } from "./Module";
import { AudioModule, createModule } from "./Module";
import Master from "./Module/Master";
import VirtualMidi from "./Module/VirtualMidi";
import VoiceScheduler from "./Module/VoiceScheduler";
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
  midiDeviceManager: MidiDeviceManager;
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
    this.midiDeviceManager = new MidiDeviceManager();

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

    const applyRoutesRequired = this.applyRoutesRequired(audioModule, props);
    audioModule.props = props;
    if (applyRoutesRequired) applyRoutes(Object.values(this.routes));

    return audioModule.serialize();
  }

  addRoute(props: RouteProps) {
    const route = createRoute(props);
    const newRoutes = { ...this.routes, [route.id]: route };

    applyRoutes(Object.values(newRoutes));
    this.routes = newRoutes;

    return route;
  }

  removeRoute(route: RouteInterface) {
    delete this.routes[route.id];
    applyRoutes(Object.values(this.routes));
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

  triggerVirtualMidi(id: string, noteName: string, type: string) {
    const virtualMidi = this.findById(id) as VirtualMidi;

    virtualMidi.sendMidi(MidiEvent.fromNote(noteName, type));
  }

  dispose() {
    Object.values(this.modules).forEach((m) => {
      if (m.type === "master") return;

      m.dispose();
    });

    this.modules = { [this._master.id]: this._master };
    this.routes = {};
  }

  findById(id: string): AudioModule {
    const audioModule = this.modules[id];

    if (!audioModule) throw Error(`Audio module with id ${id} not exists`);

    return audioModule;
  }

  private applyRoutesRequired(audioModule: AudioModule, props: any) {
    if (!props.polyNumber) return false;
    if (!(audioModule instanceof VoiceScheduler)) return false;

    return props.polyNumber !== audioModule.polyNumber;
  }
}

export default Engine.getInstance();
