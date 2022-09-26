import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from "@mui/material";

const VOICE_SELECTIONS = [1, 2, 3, 4, 5, 6];

export default function VoiceScheduler(props: {
  id: string;
  code: string;
  name: string;
  props: { numberOfVoices: number };
  updateProps: Function;
}) {
  const {
    id,
    name,
    updateProps,
    props: { numberOfVoices },
  } = props;
  const updateSelectedId = (event: SelectChangeEvent<string>) => {
    updateProps(id, { numberOfVoices: event.target.value });
  };

  if (!numberOfVoices) debugger;

  return (
    <FormControl fullWidth>
      <InputLabel id="voice-select">{name}</InputLabel>
      <Select
        labelId="voice-select"
        id="voice-select"
        value={numberOfVoices.toString()}
        label="select number of voices"
        onChange={updateSelectedId}
      >
        {VOICE_SELECTIONS.map((number) => (
          <MenuItem key={number} value={number}>
            {number}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
