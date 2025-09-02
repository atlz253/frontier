import { describe, expectTypeOf, test } from "vitest";
import {
  BuildConfig,
  classBuilder,
  defineConfig,
  defineModule,
  ModuleConfig,
} from "..";
import { MockModule } from "./mocks/modules/MockModule";

describe(defineConfig.name, () => {
  test("types should be correct", () => {
    expectTypeOf(defineConfig({})).toEqualTypeOf<BuildConfig>();
    expectTypeOf(
      defineConfig({
        modules: {
          foo: defineModule({
            builder: classBuilder(MockModule<{ baz: string }>),
            arguments: {
              baz: "test",
            },
          }),
        },
      })
    ).toEqualTypeOf<
      BuildConfig<{
        foo: Partial<
          ModuleConfig<{ baz: string }, MockModule<{ baz: string }>>
        >;
      }>
    >();
    expectTypeOf(
      defineConfig({
        modules: {
          foo: defineModule({
            builder: classBuilder(MockModule<{ bar: number; zoo: string }>),
          }),
          test: defineModule({
            builder: classBuilder(MockModule<{ port: number }>),
          }),
        },
      })
    ).toEqualTypeOf<
      BuildConfig<{
        foo: Partial<
          ModuleConfig<
            { bar: number; zoo: string },
            MockModule<{ bar: number; zoo: string }>
          >
        >;
        test: Partial<
          ModuleConfig<{ port: number }, MockModule<{ port: number }>>
        >;
      }>
    >();
  });
});
