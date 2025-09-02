import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    include: ["src/tests/**/*.test.ts"],
    typecheck: {
      enabled: true,
    },
  },
});
