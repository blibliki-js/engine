import Engine from "Engine";

const routes = [
  [
    ["midiSelector", "midi out"],
    ["voiceScheduler", "midi in"],
  ],
  [
    ["voiceScheduler", "midi out"],
    ["osc1", "midi in"],
  ],
  [
    ["voiceScheduler", "midi out"],
    ["osc2", "midi in"],
  ],
  [
    ["voiceScheduler", "midi out"],
    ["osc3", "midi in"],
  ],
  [
    ["voiceScheduler", "midi out"],
    ["amplitude", "midi in"],
  ],
  [
    ["voiceScheduler", "midi out"],
    ["frequency", "midi in"],
  ],
  [
    ["frequency", "frequency"],
    ["filter", "frequency"],
  ],
  [
    ["osc1", "output"],
    ["filter", "input"],
  ],
  [
    ["osc2", "output"],
    ["filter", "input"],
  ],
  [
    ["osc3", "output"],
    ["filter", "input"],
  ],
  [
    ["filter", "output"],
    ["amplitude", "input"],
  ],
  [
    ["amplitude", "output"],
    ["master", "input"],
  ],
];

export function applyRoutes() {
  Object.values(Engine.modules).forEach((m) => m.unplugAll());

  const succesedConnections = routes.map((route) => {
    const [[sourceCode, output], [destinationCode, input]] = route;

    const source = Engine.findByCode(sourceCode);
    const destination = Engine.findByCode(destinationCode);

    if (!source || !destination) {
      console.log(
        `missing ${sourceCode}:${output} => ${destinationCode}:${input}`
      );
      return false;
    }

    source.plug(destination, output, input);

    return true;
  });

  if (succesedConnections.every((v) => v)) {
    console.log("######## Routes succesfully applied");
  } else {
    console.log("######## Routes partialy applied");
  }
}
