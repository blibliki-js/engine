import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";

import styled from "styled-components";

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
    <Main>
      <Synth />
    </Main>
  );
}
