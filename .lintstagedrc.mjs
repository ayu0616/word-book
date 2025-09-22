// @ts-check

/** @type {import('lint-staged').Configuration} */
export default {
  "*.{js,mjs,ts,jsx,tsx,json,jsonc}": "biome check --write",
};
