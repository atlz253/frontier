import { beforeEach, describe, expect, test } from "vitest";
import { BuildConfig, Builder, ConfigComposer } from "../src/index";
import { mockModule, MockModule } from "./mocks/modules/MockModule";
import strings from "../src/strings";

describe(Builder.name, () => {
  let builder = new Builder();

  beforeEach(() => {
    builder = new Builder();
  });

  test("modules create", async () => {
    const result = await builder.build({
      modules: {
        module1: {
          builder: mockModule,
          arguments: {
            foo: "bar",
          },
        },
        module2: {
          builder: mockModule,
          arguments: {
            zoo: "boo",
          },
        },
      },
    });
    expect((result["module1"] as MockModule).props).toEqual({ foo: "bar" });
    expect((result["module2"] as MockModule).props).toEqual({ zoo: "boo" });
  });

  test("dependencies inject", async () => {
    const result = await builder.build({
      modules: {
        a: {
          builder: mockModule,
          dependencies: ["b", "c"],
        },
        b: {
          builder: mockModule,
        },
        c: {
          builder: mockModule,
          dependencies: ["b"],
        },
      },
    });
    expect((result["a"] as MockModule).props.dependencies["b"]).toEqual(
      result["b"]
    );
    expect((result["a"] as MockModule).props.dependencies["c"]).toEqual(
      result["c"]
    );
    expect((result["c"] as MockModule).props.dependencies["b"]).toEqual(
      result["b"]
    );
  });

  test("throw error if dependency missing", async () => {
    expect(
      async () =>
        await builder.build({
          modules: { a: { builder: mockModule, dependencies: ["b", "c"] } },
        })
    ).rejects.toThrowError(strings.error.missingDependencies(["b", "c"]));
  });

  test("throw error if builder missing", async () => {
    expect(
      async () => await builder.build({ modules: { a: {} } })
    ).rejects.toThrowError(strings.error.missingBuilder("a"));
  });

  test("build with overrides", async () => {
    const result = await builder.build(
      {
        modules: {
          a: {
            builder: mockModule,
            arguments: { foo: "baz" },
            dependencies: ["b", "c"],
          },
          b: {
            arguments: { doo: "zoo" },
          },
        },
      },
      {
        modules: {
          b: { builder: mockModule },
          c: { builder: mockModule, arguments: { goo: "dfd" } },
        },
      },
      {
        modules: {
          a: {
            arguments: { foo: "test", zoo: "doo" },
            dependencies: ["b"],
          },
        },
      }
    );
    expect((result["a"] as MockModule).props).toEqual({
      foo: "test",
      zoo: "doo",
      dependencies: { b: result["b"] },
    });
    expect((result["b"] as MockModule).props).toEqual({ doo: "zoo" });
    expect((result["c"] as MockModule).props).toEqual({ goo: "dfd" });
  });

  test("await builder functions", async () => {
    const result = await builder.build({
      modules: { a: { builder: async (props) => new MockModule(props) } },
    });
    expect(result["a"]).instanceOf(MockModule);
  });
});

describe(ConfigComposer.name, () => {
  let composer = new ConfigComposer();

  beforeEach(() => {
    composer = new ConfigComposer();
  });

  test("return config if overrides missing", () => {
    const config: BuildConfig = { modules: { a: { builder: mockModule } } };
    expect(composer.override(config)).toBe(config);
  });

  test("modules merge", () => {
    expect(
      composer.override(
        { modules: { a: { builder: mockModule } } },
        { modules: { b: { builder: mockModule } } }
      )
    ).toEqual({
      modules: { a: { builder: mockModule }, b: { builder: mockModule } },
    });
  });

  test("module options override", () => {
    const builder1 = (props) => new MockModule(props);
    const builder2 = (props) => new MockModule(props);
    expect(
      composer.override(
        {
          modules: {
            a: {
              builder: builder1,
              arguments: { foo: "bar", bar: "baz" },
              dependencies: ["b", "c"],
            },
          },
        },
        {
          modules: {
            a: {
              builder: builder2,
              arguments: { foo: "zoo", dee: "gee" },
              dependencies: ["e", "f"],
            },
          },
        }
      )
    ).toEqual({
      modules: {
        a: {
          builder: builder2,
          arguments: { foo: "zoo", bar: "baz", dee: "gee" },
          dependencies: ["e", "f"],
        },
      },
    });
  });
});
