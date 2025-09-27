import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/domain/**/*.ts",
        "src/application/**/*.ts",
        "src/infrastructure/**/*.ts",
        "src/lib/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.d.ts",
        "src/app/**",
        "src/db/**",
        "src/lib/hono.ts",
        "src/lib/hono-server.ts",
        "next.config.ts",
        "drizzle.config.ts",
        "postcss.config.mjs",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
