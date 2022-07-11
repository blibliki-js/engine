import { useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from "@mui/material";

import { useAppSelector, useAppDispatch } from "hooks";

import { initialize, selectDevice } from "./midiDevicesSlice";

export default function MidiDeviceSelector() {
  const dispatch = useAppDispatch();
  const { selectedDeviceId = "", devices } = useAppSelector(
    (state) => state.midiDevices
  );

  useEffect(() => {
    dispatch(initialize());
  }, [dispatch]);

  const onChange = (event: SelectChangeEvent) => {
    dispatch(selectDevice(event.target.value));
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">MIDI device</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={selectedDeviceId}
        label="select MIDI devide"
        onChange={onChange}
      >
        {devices.map((device) => (
          <MenuItem key={device.id} value={device.id}>
            {device.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
