# Blibliki Engine

Blibliki Engine is a data-driven, non-UI JavaScript library written in TypeScript that serves as a framework for building synthesizers.
Built on top of ToneJS, it aims to provide a streamlined interface for creating custom synthesizers.

## Approach

The engine operates in a data-driven manner, allowing developers to provide changes to the current module configuration rather than directly accessing the modules themselves.
This approach facilitates seamless integration with state management libraries like Redux, making it easy to build applications with centralized state management.

One notable advantage of the data-driven approach is the ability to easily save and recall patches. By representing the synthesizer configuration as data, developers can effortlessly store and load patches, enabling users to save and share their custom presets.

Blibliki Engine offers polyphony support and provides access to essential audio modules such as oscillators, filters, envelopes, and effects. It's important to note that the list of available audio modules will be extended as the development of the engine continues.

## Installing

```bash
npm install @blibliki/engine
```

## Usage

```JavaScript
import Engine from "@blibliki/engine";
```

#### Initialize

`Engine.initialize` returns a promise that resolves when the engine is initialized and ready for use.

```JavaScript
Engine.initialize({ context: { lookAhead: 0.03 } });
```

#### Start / Stop

This methods are triggering all audio modules to start or stop

```JavaScript
Engine.start();
Engine.stop();
```

#### Modules

##### AudioModule structure

All audio modules share the shame structure.
The props structure vary per audioModule.

```JavaScript
{
  id: string,
  name: string,
  props: Object,
  inputs: [{
    id: string,
    name: string,
    moduleId: string,
    moduleName: string
  }],
  outputs: [{
    id: string,
    name: string,
    moduleId: string,
    moduleName: string
  }],
}
```

##### Create audio module

```JavaScript
const master = Engine.master;
const osc = Engine.addModule({ name: "Osc", type: "Oscillator" });
const volume = Engine.addModule({
  name: "Vol",
  type: "Volume",
  props: { volume: -10 },
});
```

##### Update props

```JavaScript
// Update props
Engine.updateModule({ id: volume.id, changes: { props: { volume: -20 } } });
Engine.updateModule({ id: osc.id, changes: { props: { wave: "square", fine: -10 } } });
```

##### Remove audio module

```JavaScript
Engine.removeModule(osc.id);
```

#### Routes

##### Route structure

```JavaScript
{
  id: string,
  sourceId: string,
  outputName: string,
  destinationId: string,
  inputName: string,
}
```

##### Add Route

```JavaScript
// Connect oscillator out to volume input
const oscVolRoute = Engine.addRoute({
  sourceId: osc.id,
  outputName: "output",
  destinationId: volume.id,
  inputName: "input",
});

// Connect oscillator out to volume input
const volToMaster = Engine.addRoute({
  sourceId: volume.id,
  outputName: "output",
  destinationId: master.id,
  inputName: "input",
});
```

##### Remove route

```JavaScript
Engine.removeRoute(oscVolRoute.id);
```

## Contributing

As a work-in-progress project, Blibliki Engine actively welcomes contributions and feedback from the community. Whether it's reporting issues, suggesting new features, or submitting code changes, contributors are encouraged to get involved and help shape the future of Blibliki Engine.
