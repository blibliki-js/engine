import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

import { RootState, AppDispatch } from "store";
import MidiDeviceManager from "Engine/MidiDeviceManager";
import MidiDevice, { MidiDeviceInterface } from "Engine/MidiDevice";

const devicesAdapter = createEntityAdapter<MidiDeviceInterface>({});

export const midiDevicesSlice = createSlice({
  name: "midiDevices",
  initialState: devicesAdapter.getInitialState(),
  reducers: {
    setDevices: devicesAdapter.setAll,
    addDevice: devicesAdapter.addOne,
    removeDevice: devicesAdapter.removeOne,
    updateDevice: devicesAdapter.updateOne,
  },
});

const { setDevices, addDevice, removeDevice } = midiDevicesSlice.actions;

export const initialize = () => (dispatch: AppDispatch) => {
  MidiDeviceManager.fetchDevices().then((devices) => {
    dispatch(setDevices(devices.map((d) => d.serialize())));
  });

  MidiDeviceManager.onStateChange((device: MidiDevice) => {
    if (device.state === "disconnected") {
      device.disconnect();
      dispatch(removeDevice(device.id));
    } else {
      dispatch(addDevice(device.serialize()));
    }
  });
};

export const devicesSelector = devicesAdapter.getSelectors(
  (state: RootState) => state.midiDevices
);

export default midiDevicesSlice.reducer;
