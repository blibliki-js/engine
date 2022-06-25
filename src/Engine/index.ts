import Module from "./Module";

class Engine {
  modules: { [Identifier: string]: Module };

  private static instance: Engine;

  private constructor() {
    this.modules = {};
  }

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  public registerModule(modula: Module) {
    this.modules[modula.id] ??= modula;
    this.applyRoutes();
  }

  private applyRoutes() {
    console.log(Object.values(this.modules).map((m) => m.name));
    const oscs = Object.values(this.modules).filter((m: Module) =>
      m.name.startsWith("Osc")
    );
    const ampEnv = Object.values(this.modules).find(
      (m: Module) => m.name === "Amp Envelope"
    );

    if (oscs.length !== 3 || !ampEnv) return;

    oscs.forEach((osc) => osc.connect(ampEnv));
    ampEnv.toDestination();
    console.log("connected");
  }
}

export default Engine.getInstance();
