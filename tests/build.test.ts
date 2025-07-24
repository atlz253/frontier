import { describe, expect, test } from "vitest";
import { build } from "../src/index";
import { MockModule } from "./mocks/modules/MockModule";
import { ReadonlyMap } from "../src/utils/ReadonlyMap";

describe(build.name, () => {
  test("should create modules", () => {
    const result = build({
      modules: {
        module1: {
          constructor: (props) => new MockModule(props),
          arguments: {
            foo: "bar",
          },
        },
        module2: {
          constructor: (props) => new MockModule(props),
          arguments: {
            zoo: "boo",
          },
        },
      },
    });
    expect(result).instanceOf(ReadonlyMap);
    expect(result.get("module1").props).toEqual({ foo: "bar" });
    expect(result.get("module2").props).toEqual({ zoo: "boo" });
  });
});
