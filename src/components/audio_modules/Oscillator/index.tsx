import { useEffect } from "react";
import Backend from "./Backend";

export default function Oscillator() {
  useEffect(() => {
    const backend = new Backend();
    backend.start();
  }, []);

  return <div>Oscillator</div>;
}
