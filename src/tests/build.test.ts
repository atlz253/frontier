import { beforeEach, describe, expect, test } from "vitest";
import { BuildConfig, Builder, ConfigComposer, defineModule } from "../index";
import { mockModule, MockModule } from "./mocks/modules/MockModule";
import strings from "../strings";

describe(Builder.name, () => {
  let builder = new Builder();

  beforeEach(() => {
    builder = new Builder();
  });

  test("modules create", async () => {
    const result = await builder.build({
      modules: {
        module1: defineModule({
          builder: mockModule,
          arguments: {
            foo: "bar",
          },
        }),
        module2: defineModule({
          builder: mockModule,
          arguments: {
            zoo: "boo",
          },
        }),
      },
    });
    expect((result["module1"] as MockModule).props).toEqual({ foo: "bar" });
    expect((result["module2"] as MockModule).props).toEqual({ zoo: "boo" });
  });

  test("dependencies inject", async () => {
    const result = await builder.build({
      modules: {
        a: defineModule({
          builder: mockModule,
          dependencies: ["b", "c"],
        }),
        b: defineModule({
          builder: mockModule,
        }),
        c: defineModule({
          builder: mockModule,
          dependencies: ["b"],
        }),
      },
    });
    expect(
      (result["a"] as MockModule<{ dependencies: { b: MockModule } }>).props
        .dependencies["b"]
    ).toEqual(result["b"]);
    expect(
      (result["a"] as MockModule<{ dependencies: { c: MockModule } }>).props
        .dependencies["c"]
    ).toEqual(result["c"]);
    expect(
      (result["c"] as MockModule<{ dependencies: { b: MockModule } }>).props
        .dependencies["b"]
    ).toEqual(result["b"]);
  });

  test("throw error if dependency missing", async () => {
    await expect(
      async () =>
        await builder.build({
          modules: {
            a: defineModule({ builder: mockModule, dependencies: ["b", "c"] }),
          },
        })
    ).rejects.toThrowError(strings.error.missingDependencies(["b", "c"]));
  });

  test("throw error if builder missing", async () => {
    await expect(
      async () =>
        await builder.build({
          modules: { a: defineModule({}) },
        })
    ).rejects.toThrowError(strings.error.missingBuilder("a"));
  });

  test("build with overrides", async () => {
    const result = await builder.build(
      {
        modules: {
          a: defineModule({
            builder: mockModule,
            arguments: { foo: "baz", obj: { a: "a", b: "b" } },
            dependencies: ["b", "c"],
          }),
          b: defineModule({
            arguments: { doo: "zoo" },
          }),
        },
      },
      {
        modules: {
          b: defineModule({ builder: mockModule }),
          c: defineModule({ builder: mockModule, arguments: { goo: "dfd" } }),
        },
      },
      {
        modules: {
          a: defineModule({
            arguments: { foo: "test", zoo: "doo" },
            dependencies: ["b"],
          }),
        },
      },
      {
        modules: {
          a: defineModule({
            arguments: { obj: { b: "o", c: "c" } },
          }),
        },
      }
    );
    expect((result["a"] as MockModule).props).toEqual({
      foo: "test",
      zoo: "doo",
      obj: { a: "a", b: "o", c: "c" },
      dependencies: { b: result["b"] },
    });
    expect((result["b"] as MockModule).props).toEqual({ doo: "zoo" });
    expect((result["c"] as MockModule).props).toEqual({ goo: "dfd" });
  });

  test("await builder functions", async () => {
    const result = await builder.build({
      modules: {
        a: defineModule({ builder: async (props) => new MockModule(props) }),
      },
    });
    expect(result["a"]).instanceOf(MockModule);
  });

  test("object dependencies config", async () => {
    const result = await builder.build({
      modules: {
        a: defineModule({
          builder: mockModule,
          dependencies: { foo: "b", bar: "c" },
        }),
        b: defineModule({ builder: mockModule }),
        c: defineModule({ builder: mockModule }),
      },
    });
    expect(
      (result["a"] as MockModule<{ dependencies: { foo: MockModule } }>).props
        .dependencies.foo
    ).toEqual(result["b"] as MockModule);
    expect(
      (result["a"] as MockModule<{ dependencies: { bar: MockModule } }>).props
        .dependencies.bar
    ).toEqual(result["c"] as MockModule);
    expect(
      (result["a"] as MockModule<{ dependencies: { b: undefined } }>).props
        .dependencies.b
    ).toBe(undefined);
    expect(
      (result["a"] as MockModule<{ dependencies: { c: undefined } }>).props
        .dependencies.c
    ).toBe(undefined);
  });
});

describe(ConfigComposer.name, () => {
  let composer = new ConfigComposer();

  beforeEach(() => {
    composer = new ConfigComposer();
  });

  test("return config if overrides missing", () => {
    const config: BuildConfig = {
      modules: { a: defineModule({ builder: mockModule }) },
    };
    expect(composer.override(config)).toBe(config);
  });

  test("modules merge", () => {
    expect(
      composer.override(
        { modules: { a: defineModule({ builder: mockModule }) } },
        { modules: { b: defineModule({ builder: mockModule }) } }
      )
    ).toEqual({
      modules: {
        a: defineModule({ builder: mockModule }),
        b: defineModule({ builder: mockModule }),
      },
    });
  });

  test("module options override", () => {
    const builder1 = mockModule;
    const builder2 = mockModule;
    expect(
      composer.override(
        {
          modules: {
            a: defineModule({
              builder: builder1,
              arguments: { foo: "bar", bar: "baz" },
              dependencies: ["b", "c"],
            }),
          },
        },
        {
          modules: {
            a: defineModule({
              builder: builder2,
              arguments: { foo: "zoo", dee: "gee" },
              dependencies: ["e", "f"],
            }),
          },
        }
      )
    ).toEqual({
      modules: {
        a: defineModule({
          builder: builder2,
          arguments: { foo: "zoo", bar: "baz", dee: "gee" },
          dependencies: ["e", "f"],
        }),
      },
    });
  });
});
