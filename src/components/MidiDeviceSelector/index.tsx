import { useEffect, ChangeEvent } from "react";

import MidiDevice from "Engine/MidiDevice";
import { useAppSelector, useAppDispatch } from "hooks";

import { initialize, selectDevice } from "./midiDevicesSlice";

export default function MidiDeviceSelector() {
  const dispatch = useAppDispatch();
  const { selectedDeviceId, devices } = useAppSelector(
    (state) => state.midiDevices
  );

  useEffect(() => {
    dispatch(initialize());
  }, [dispatch]);

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectDevice(event.target.value));
  };

  return (
    <select
      className="drop-control"
      onChange={onChange}
      value={selectedDeviceId}
    >
      <Devices devices={devices} />
    </select>
  );
}

interface DevicesProps {
  devices: MidiDevice[];
}

function Devices(props: DevicesProps) {
  const { devices } = props;

  const devicesWithPrompt = [
    ["", "Select midi"],
    ...devices.map((d) => [d.id, d.name]),
  ];

  return (
    <>
      {devicesWithPrompt.map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </>
  );
}
