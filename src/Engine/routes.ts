import VoiceManager from "Engine/VoiceManager";

const routes = [
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

export function applyRoutes(voiceManager: VoiceManager) {
  Object.values(voiceManager.modules).forEach((m) => m.unplugAll());

  routes.forEach((route) => {
    const [[sourceCode, output], [destinationCode, input]] = route;

    const sources = voiceManager.findAllByCode(sourceCode);
    const destinations = voiceManager.findAllByCode(destinationCode);

    if (sources.length === 1) {
      destinations.forEach((d) => sources[0].plug(d, output, input));
    } else if (destinations.length === 1) {
      sources.forEach((s) => s.plug(destinations[0], output, input));
    } else {
      sources.forEach((s) => {
        const destination = destinations.find((d) => d.voiceNo === s.voiceNo);
        if (!destination) return;

        s.plug(destination, output, input);
      });
    }
  });
}
