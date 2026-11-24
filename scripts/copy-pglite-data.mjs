import { copyFileSync, existsSync } from "node:fs";

const dir = ".vercel/output/functions/__server.func/_libs";
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

if (!existsSync(dir)) {
  console.log("[pglite] skip asset copy");
} else {
  for (const file of files) {
    copyFileSync(`node_modules/@electric-sql/pglite/dist/${file}`, `${dir}/${file}`);
  }
  console.log("[pglite] copied runtime assets for the production bundle");
}
