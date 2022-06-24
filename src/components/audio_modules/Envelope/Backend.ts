import { Envelope } from "tone";

export default class Backend {
  envelope: Envelope;

  constructor() {
    this.envelope = new Envelope(0, 1, 0, 0);
  }

  triggerAttack() {
    this.envelope.triggerAttack();
  }

  triggerRelease() {
    this.envelope.triggerRelease();
  }
}
