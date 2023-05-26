import { Context, now, setContext } from "tone";
import MidiDeviceManager from "./MidiDeviceManager";
import MidiEvent, { EType } from "./MidiEvent";

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
  private propsUpdateCallbacks: { (id: string, props: any): void }[];
  private _isStarted: boolean = false;

  modules: {
    [Identifier: string]: AudioModule;
  };

  routes: {
    [Identifier: string]: RouteInterface;
  };

  private constructor() {
    this.modules = {};
    this.routes = {};
    this.propsUpdateCallbacks = [];
  }

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  initialize(props: InitializeInterface) {
    return new Promise((resolve) => {
      if (this.context) return resolve({ master: this.master });

      this.context = new Context(props.context);
      setContext(this.context);
      this.context.transport.start();

      this.midiDeviceManager = new MidiDeviceManager();

      setTimeout(() => {
        resolve({ master: this.master });
      }, 0);
    });
  }

  addModule(name: string, type: string, props: any = {}) {
    const audioModule = createModule(name, type, {});
    audioModule.props = props;
    this.modules[audioModule.id] = audioModule;

    this.updateRoutes();

    return audioModule.serialize();
  }

  removeModule(id: string) {
    this.modules[id].dispose();
    const moduleRouteIds = this.moduleRouteIds(id);

    moduleRouteIds.forEach((routeId) => delete this.routes[routeId]);
    this.updateRoutes();
    delete this.modules[id];

    return moduleRouteIds;
  }

  updateNameModule(id: string, name: string) {
    const audioModule = this.findById(id);
    audioModule.name = name;

    return audioModule.serialize();
  }

  onPropsUpdate(callback: (id: string, props: any) => void) {
    this.propsUpdateCallbacks.push(callback);
  }

  _triggerPropsUpdate(id: string, props: any) {
    this.propsUpdateCallbacks.forEach((callback) => callback(id, props));
  }

  updatePropsModule(id: string, props: any) {
    const audioModule = this.findById(id);

    const applyRoutesRequired = this.applyRoutesRequired(audioModule, props);
    audioModule.props = props;
    if (applyRoutesRequired) this.updateRoutes();

    return audioModule.serialize();
  }

  addRoute(props: RouteProps) {
    const route = createRoute(props);
    const newRoutes = { ...this.routes, [route.id]: route };

    this.routes = newRoutes;
    this.updateRoutes();

    return route;
  }

  removeRoute(id: string) {
    delete this.routes[id];
    this.updateRoutes();
  }

  get master() {
    if (this._master) return this._master.serialize();

    const masterProps = this.addModule("Master", "Master");
    this._master = this.modules[masterProps.id] as Master;

    return masterProps;
  }

  triggerVirtualMidi(id: string, noteName: string, type: EType) {
    const virtualMidi = this.findById(id) as VirtualMidi;

    virtualMidi.sendMidi(MidiEvent.fromNote(noteName, type));
  }

  dispose() {
    Object.values(this.modules).forEach((m) => {
      if (m instanceof Master) return;

      m.dispose();
    });

    this.modules = this._master ? { [this._master.id]: this._master } : {};
    this.routes = {};
  }

  findById(id: string): AudioModule {
    const audioModule = this.modules[id];

    if (!audioModule) throw Error(`Audio module with id ${id} not exists`);

    return audioModule;
  }

  get isStarted() {
    return (
      this.context !== undefined &&
      this.context.transport.state === "started" &&
      this._isStarted
    );
  }

  start() {
    const startTime = now();
    this._isStarted = true;
    this.updateRoutes();

    Object.values(this.modules).forEach((audioModule) => {
      const am = audioModule as any;
      if (!am.start) return;

      am.start(startTime);
    });
  }

  stop() {
    const startTime = now();
    Object.values(this.modules).forEach((audioModule) => {
      const am = audioModule as any;
      if (!am.stop) return;

      am.stop(startTime);
    });

    this._isStarted = false;
  }

  get bpm() {
    return this.context.transport.bpm.value;
  }

  set bpm(value: number) {
    this.context.transport.bpm.value = value;
  }

  updateRoutes() {
    applyRoutes(Object.values(this.routes));
  }

  private applyRoutesRequired(audioModule: AudioModule, props: any) {
    if (!props.polyNumber) return false;
    if (!(audioModule instanceof VoiceScheduler)) return false;

    return props.polyNumber !== audioModule.polyNumber;
  }

  private moduleRouteIds(id: string) {
    const cloneRoutes = { ...this.routes };

    const routeIds = Object.keys(cloneRoutes).filter((routeId) => {
      const { sourceId, destinationId } = cloneRoutes[routeId];

      return sourceId === id || destinationId === id;
    });

    return routeIds;
  }
}

export default Engine.getInstance();
