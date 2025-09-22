// @ts-check

/** @type {import('lint-staged').Configuration} */
export default {
  "*.{js,mjs,ts,mts,jsx,tsx,json,jsonc}": "biome check --write",
};
