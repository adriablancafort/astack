import { nodeResolve } from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
    preserveModules: true,
  },
  external: (id: string) => {
    if (id.startsWith("@workspace/")) return false
    if (id.startsWith("@/")) return false
    if (id.startsWith(".")) return false
    if (id.startsWith("/")) return false
    return true
  },
  plugins: [
    nodeResolve(),
    typescript({
      include: ["src/**/*", "../../packages/*/src/**/*"],
    }),
    terser(),
  ],
}
