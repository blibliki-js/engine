import { useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from "@mui/material";

import { useAppSelector, useAppDispatch } from "hooks";

import { initialize, devicesSelector } from "./midiDevicesSlice";

export default function MidiDeviceSelector(props: {
  id: string;
  code: string;
  name: string;
  props: { selectedId: string };
  updateProps: Function;
}) {
  const {
    id,
    name,
    updateProps,
    props: { selectedId },
  } = props;

  const dispatch = useAppDispatch();
  const devices = useAppSelector((state) => devicesSelector.selectAll(state));

  useEffect(() => {
    dispatch(initialize());
  }, [dispatch]);

  const updateSelectedId = (event: SelectChangeEvent<string>) => {
    updateProps(id, { selectedId: event.target.value });
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="midi-select">{name}</InputLabel>
      <Select
        labelId="midi-select"
        id="midi-select"
        value={selectedId || ""}
        label="select MIDI devide"
        onChange={updateSelectedId}
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
