import { ReadonlyMap } from "./utils/ReadonlyMap";

interface ModuleConfig<T extends object = any> {
  constructor: (props: T & { dependencies: ReadonlyMap<string, any> }) => any;
  arguments?: T;
  dependencies?: string[];
}

type BuildConfig = {
  modules: Record<string, ModuleConfig>;
};

export function build(config: BuildConfig) {
  const modules = new Map();
  for (const [name, options] of Object.entries(config.modules)) {
    modules.set(name, options.constructor({ ...options.arguments }));
  }
  return new ReadonlyMap(modules);
}
