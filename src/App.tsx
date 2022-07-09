import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import styled from "@emotion/styled";
import { StyledEngineProvider } from "@mui/material/styles";

import { store } from "./store";
import { initialize } from "./globalSlice";
import Synth from "./Synth";

const Main = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function ProviderApp() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initialize());
  }, [dispatch]);

  return (
    <StyledEngineProvider injectFirst>
      <Main>
        <Synth />
      </Main>
    </StyledEngineProvider>
  );
}
