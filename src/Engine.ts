import { Context, now, setContext } from "tone";
import { MidiEvent, MidiDeviceManager } from "./core/midi";

import { AudioModule, Startable } from "./core/Module";
import { Master, createModule, VirtualMidi, VoiceScheduler } from "./modules";
import { applyRoutes, createRoute, RouteInterface, RouteProps } from "./routes";
import { AnyObject } from "./types";

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
  private context: Context;
  private propsUpdateCallbacks: { (id: string, props: AnyObject): void }[];
  private _isStarted = false;

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
      if (this.context) return resolve({});

      this.context = new Context(props.context);
      setContext(this.context);
      this.context.transport.start();

      this.midiDeviceManager = new MidiDeviceManager();

      setTimeout(() => {
        resolve({});
      }, 0);
    });
  }

  addModule(params: {
    id?: string;
    name: string;
    type: string;
    props?: AnyObject;
  }) {
    const { id, name, type, props = {} } = params;

    const audioModule = createModule({ id, name, type, props: {} });
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

  onPropsUpdate(callback: (id: string, props: AnyObject) => void) {
    this.propsUpdateCallbacks.push(callback);
  }

  _triggerPropsUpdate(id: string, props: AnyObject) {
    this.propsUpdateCallbacks.forEach((callback) => callback(id, props));
  }

  updatePropsModule(id: string, props: AnyObject) {
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

  triggerVirtualMidi(id: string, noteName: string, type: "noteOn" | "noteOff") {
    const virtualMidi = this.findById(id) as VirtualMidi;

    virtualMidi.sendMidi(MidiEvent.fromNote(noteName, type === "noteOn"));
  }

  dispose() {
    Object.values(this.modules).forEach((m) => {
      if (m instanceof Master) return;

      m.dispose();
    });

    this.modules = {};
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
      const am = audioModule as unknown as Startable;
      if (!am.start) return;

      am.start(startTime);
    });
  }

  stop() {
    const startTime = now();
    Object.values(this.modules).forEach((audioModule) => {
      const am = audioModule as unknown as Startable;
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

  private applyRoutesRequired(audioModule: AudioModule, props: AnyObject) {
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
