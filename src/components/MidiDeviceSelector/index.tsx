import { useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from "@mui/material";

import { useAppSelector, useAppDispatch } from "hooks";

import { initialize, selectDevice, devicesSelector } from "./midiDevicesSlice";

export default function MidiDeviceSelector() {
  const dispatch = useAppDispatch();
  const devices = useAppSelector((state) => devicesSelector.selectAll(state));

  useEffect(() => {
    dispatch(initialize());
  }, [dispatch]);

  const selectedId = devices.find((d) => d.selected)?.id || "";

  const onChange = (event: SelectChangeEvent) => {
    dispatch(selectDevice(event.target.value));
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">MIDI device</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={selectedId}
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
