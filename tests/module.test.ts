import { describe, test } from "vitest";
import { Module } from "../src/module.ts";

describe(Module.name, () => {
  test("should create", () => {
    const module = new Module();
  });
});
