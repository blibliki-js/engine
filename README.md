# Blibliki Engine

Blibliki Engine is a data-driven, non-UI JavaScript library written in TypeScript that serves as a framework for building synthesizers.
Built on top of ToneJS, it aims to provide a streamlined interface for creating custom synthesizers.

## Approach

The engine operates in a data-driven manner, allowing developers to provide changes to the current module configuration rather than directly accessing the modules themselves.
This approach facilitates seamless integration with state management libraries like Redux, making it easy to build applications with centralized state management.

One notable advantage of the data-driven approach is the ability to easily save and recall patches. By representing the synthesizer configuration as data, developers can effortlessly store and load patches, enabling users to save and share their custom presets.

Blibliki Engine offers polyphony support and provides access to essential audio modules such as oscillators, filters, envelopes, and effects. It's important to note that the list of available audio modules will be extended as the development of the engine continues.

## Contributing

As a work-in-progress project, Blibliki Engine actively welcomes contributions and feedback from the community. Whether it's reporting issues, suggesting new features, or submitting code changes, contributors are encouraged to get involved and help shape the future of Blibliki Engine.
