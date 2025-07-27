import { beforeEach, describe, expect, test } from "vitest";
import { Builder } from "../src/index";
import { mockModule, MockModule } from "./mocks/modules/MockModule";
import strings from "../src/strings";

describe(Builder.name, () => {
  let builder = new Builder();

  beforeEach(() => {
    builder = new Builder();
  });

  test("should create modules", () => {
    const result = builder.build({
      modules: {
        module1: {
          constructor: mockModule,
          arguments: {
            foo: "bar",
          },
        },
        module2: {
          constructor: mockModule,
          arguments: {
            zoo: "boo",
          },
        },
      },
    });
    expect((result.get("module1") as MockModule).props).toEqual({ foo: "bar" });
    expect((result.get("module2") as MockModule).props).toEqual({ zoo: "boo" });
  });

  test("dependencies inject should work", () => {
    const result = builder.build({
      modules: {
        a: {
          constructor: mockModule,
          dependencies: ["b", "c"],
        },
        b: {
          constructor: mockModule,
        },
        c: {
          constructor: mockModule,
          dependencies: ["b"],
        },
      },
    });
    expect((result.get("a") as MockModule).props.dependencies.get("b")).toEqual(
      result.get("b")
    );
    expect((result.get("a") as MockModule).props.dependencies.get("c")).toEqual(
      result.get("c")
    );
    expect((result.get("c") as MockModule).props.dependencies.get("b")).toEqual(
      result.get("b")
    );
  });

  test("should throw error if dependency missing", () => {
    expect(() =>
      builder.build({
        modules: { a: { constructor: mockModule, dependencies: ["b", "c"] } },
      })
    ).toThrowError(strings.error.missingDependencies(["b", "c"]));
  });
});
