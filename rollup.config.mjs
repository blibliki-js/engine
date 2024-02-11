import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts", // Entry point
  output: [
    {
      file: "dist/main.cjs.js",
      format: "cjs", // CommonJS
      sourcemap: true,
    },
    {
      file: "dist/main.esm.js",
      format: "esm", // ES Modules
      sourcemap: true,
    },
  ],
  plugins: [typescript(), nodeResolve(), commonjs(), terser()],
};
