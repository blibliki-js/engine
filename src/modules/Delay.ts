import { FeedbackDelay } from "tone";

import Effect, { EffectInterface } from "./Effect";

interface DelayInterface extends EffectInterface {
  delayTime: number;
  feedback: number;
}

const InitialProps: Partial<DelayInterface> = {
  delayTime: 1,
  feedback: 0.3,
};

export default class Delay extends Effect<FeedbackDelay, DelayInterface> {
  static moduleName = "Delay";

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<DelayInterface>;
  }) {
    const { id, name, props } = params;

    super({
      id,
      name,
      internalModule: new FeedbackDelay(),
      props: {
        ...InitialProps,
        ...props,
      },
    });
  }

  get delayTime() {
    return this._props["delayTime"];
  }

  set delayTime(value: number) {
    this._props = { ...this.props, delayTime: value };
    this.internalModule.delayTime.value = this.delayTime;
  }

  get feedback() {
    return this._props["feedback"];
  }

  set feedback(value: number) {
    this._props = { ...this.props, feedback: value };
    this.internalModule.feedback.value = this.feedback;
  }
}
