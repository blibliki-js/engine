import { useEffect } from "react";

import Backend from "./Backend";

export default function Envelope() {
  useEffect(() => {
    new Backend();
  }, []);

  return <div>Envelope</div>;
}
