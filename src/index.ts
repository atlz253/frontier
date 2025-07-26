interface ModuleConfig<T extends object = {}> {
  arguments?: T;
  dependencies?: string[];
  constructor: (props: T & { dependencies?: Map<string, unknown> }) => any;
}

type BuildConfig = {
  modules?: Record<string, ModuleConfig>;
};

export class Builder {
  #modules: Map<string, unknown> = new Map();
  #expectDependencies: Map<string, Map<string, unknown>[]> = new Map();

  build(config: BuildConfig) {
    this.#clear();
    this.#buildModules(config);
    return this.#modules;
  }

  #clear() {
    this.#modules = new Map(); // TODO: to object
    this.#expectDependencies = new Map();
  }

  #buildModules(config: BuildConfig) {
    if (config.modules)
      Object.entries(config.modules).forEach(([name, options]) =>
        this.#resolveExpectDependencies({
          name,
          module: this.#buildModule({ name, options }),
        })
      );
  }

  #buildModule({ name, options }: { name: string; options: ModuleConfig }) {
    const result = options.constructor({
      ...options.arguments,
      dependencies: this.#dependencies(options.dependencies),
    });
    this.#modules.set(name, result);
    return result;
  }

  #resolveExpectDependencies({
    name,
    module,
  }: {
    name: string;
    module: unknown;
  }) {
    if (this.#expectDependencies.has(name)) {
      this.#expectDependencies.get(name)?.forEach((m) => m.set(name, module));
      this.#expectDependencies.delete(name);
    }
  }

  #dependencies(dependencies: string[] | undefined) {
    if (dependencies === undefined) return undefined;
    const result = new Map<string, unknown>();
    dependencies.forEach((d) =>
      this.#modules.has(d)
        ? result.set(d, this.#modules.get(d))
        : this.#expectDependencies.has(d)
        ? this.#expectDependencies.get(d)?.push(result)
        : this.#expectDependencies.set(d, [result])
    );
    return result;
  }
}
