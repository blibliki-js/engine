import { Oscillator } from "tone";

export default class Backend {
  oscillator: Oscillator;

  constructor() {
    this.oscillator = new Oscillator(1000, "sine").toDestination();
  }

  start() {
    this.oscillator.start();
  }
}
