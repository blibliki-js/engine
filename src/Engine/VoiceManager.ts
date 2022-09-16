import Voice from "./Voice";

export default class VoiceManager {
  private _numberOfVoices: number;
  voices: Voice[];

  constructor(numberOfVoices: number = 1) {
    this.voices = [];
    this.numberOfVoices = numberOfVoices;
  }

  get numberOfVoices() {
    return this._numberOfVoices;
  }

  set numberOfVoices(value: number) {
    this.createVoices(value - this.voices.length);
    this._numberOfVoices = value;
  }

  registerModule(name: string, code: string, type: string, props: any = {}) {
    const modules = this.voices.map((v) =>
      v.registerModule(name, code, type, props)
    );

    return modules[0].serialize();
  }

  updatePropsModule(code: string, props: any) {
    const modules = this.voices.map((v) => v.updatePropsModule(code, props));

    return modules[0].serialize();
  }

  triggerKey(noteName: string, type: string) {
    let voice;

    switch (type) {
      case "noteOn":
        voice = this.voices.find((v) => !v.activeNote);
        if (voice) break;

        voice = this.voices.sort((a, b) => {
          if (!a || !b) return 0;

          return a.activeAt.getTime() - b.activeAt.getTime();
        })[0];

        break;
      case "noteOff":
        voice = this.voices.find((v) => v.activeNote === noteName);
        break;
      default:
        throw Error("This type is not a note");
    }

    if (!voice) return;

    voice.triggerKey(noteName, type);
  }

  dispose() {
    this.disposeVoices(this.voices.length);
  }

  private createVoices(value: number) {
    if (value <= 0) return;

    const voice = new Voice(this.voices.length);
    this.voices.push(voice);

    this.createVoices(value - 1);
  }

  private disposeVoices(value: number) {
    if (value <= 0) return;

    const voice = this.voices.pop();
    if (!voice) return;

    voice.dispose();

    this.disposeVoices(value - 1);
  }
}
