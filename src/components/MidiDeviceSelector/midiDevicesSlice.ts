import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "store";
import MidiDeviceManager from "Engine/MidiDeviceManager";
import MidiDevice from "Engine/MidiDevice";

interface MidiDevicesState {
  devices: MidiDevice[];
  selectedDeviceId?: string;
}

const initialState = {
  devices: [],
} as MidiDevicesState;

export const midiDevicesSlice = createSlice({
  name: "midiDevices",
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<MidiDevice[]>) => {
      state.devices = action.payload;
    },
    selectDevice: (state, action: PayloadAction<string | undefined>) => {
      state.selectedDeviceId = action.payload;
    },
    addDevice: (state, action: PayloadAction<MidiDevice>) => {
      state.devices.push(action.payload);
    },
    removeDevice: (state, action: PayloadAction<MidiDevice>) => {
      const deviceId = action.payload.id;

      if (state.selectedDeviceId === deviceId) {
        state.selectedDeviceId = undefined;
      }

      state.devices = state.devices.filter((device) => device.id !== deviceId);
    },
  },
});

const { setDevices, addDevice, removeDevice } = midiDevicesSlice.actions;

export const { selectDevice } = midiDevicesSlice.actions;

export const initialize = () => (dispatch: AppDispatch) => {
  MidiDeviceManager.fetchDevices().then((devices) => {
    dispatch(setDevices(devices));
  });

  MidiDeviceManager.onStateChange((device: MidiDevice) => {
    const action = device.state === "disconnected" ? removeDevice : addDevice;

    dispatch(action(device));
  });
};

export default midiDevicesSlice.reducer;
