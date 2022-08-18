import {
  createSlice,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";

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

export const selectDevice =
  (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const { id: prevId } = selectedDevice(state) || {};

    if (prevId) {
      MidiDeviceManager.select(prevId, false);

      dispatch(
        midiDevicesSlice.actions.updateDevice({
          id: prevId,
          changes: { selected: false },
        })
      );
    }

    MidiDeviceManager.select(id, true);

    dispatch(
      midiDevicesSlice.actions.updateDevice({
        id: id,
        changes: { selected: true },
      })
    );
  };

export const selectedDevice = createSelector(
  (state: RootState) => devicesSelector.selectAll(state),
  (devices: MidiDeviceInterface[]) => devices.find((d) => d.selected)
);

export const devicesSelector = devicesAdapter.getSelectors(
  (state: RootState) => state.midiDevices
);

export default midiDevicesSlice.reducer;
