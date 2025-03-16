import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ["public/ts/mainStarMap.ts"],
    format: ["esm"],
    outDir: "public/out_js",
    dts: true,
    splitting: false,
    noExternal: [/.*/], // force tsup to bundle all dependencies
    sourcemap: true,
    clean: true,
});
