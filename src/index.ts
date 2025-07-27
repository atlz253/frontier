import strings from "./strings";
import { cloneDeep } from "lodash";

interface ModuleConfig<Arguments extends object = {}, Result = unknown> {
  arguments: Omit<Arguments, "dependencies">;
  dependencies: string[];
  builder: (props: Arguments) => Result | Promise<Result>;
}

export interface BuildConfig {
  modules?: Record<string, Partial<ModuleConfig<any, any>>>;
}

export function defineModule<Arguments extends object, Result>(
  config: Partial<ModuleConfig<Arguments, Result>>
): Partial<ModuleConfig<Arguments, Result>> {
  return config;
}

export class ConfigComposer {
  #result: BuildConfig = { modules: {} };

  override(config: BuildConfig, ...overrides: BuildConfig[]) {
    if (overrides.length === 0) return config;
    this.#result = cloneDeep(config);
    overrides.forEach((o) => this.#merge(o));
    return this.#result;
  }

  #merge(config: BuildConfig) {
    if ("modules" in config && config.modules)
      Object.entries(config.modules).forEach(([name, options]) =>
        this.#result.modules && name in this.#result.modules
          ? this.#mergeModuleConfig(name, options)
          : this.#addModuleConfig(name, options)
      );
  }

  #mergeModuleConfig(name: string, options: Partial<ModuleConfig>) {
    if (!this.#result.modules || !(name in this.#result.modules))
      throw new Error(strings.error.moduleConfigNotFound(name));
    const result = cloneDeep(this.#result.modules[name]);
    if ("builder" in options) result.builder = options.builder;
    if ("arguments" in options) {
      if ("arguments" in result && options.arguments) {
        Object.entries(options.arguments).forEach(([key, value]) => {
          result.arguments
            ? (result.arguments[key] = value)
            : (result.arguments = { [key]: value });
        });
      } else {
        result.arguments = cloneDeep(options.arguments);
      }
    }
    if ("dependencies" in options)
      result.dependencies = cloneDeep(options.dependencies);
    this.#result.modules[name] = result;
  }

  #addModuleConfig(name: string, options: Partial<ModuleConfig>) {
    this.#result.modules
      ? (this.#result.modules[name] = cloneDeep(options))
      : (this.#result.modules = { name: cloneDeep(options) });
  }
}

export class Builder {
  #config: BuildConfig = {};
  #modules: { [name: string]: unknown } = {};
  #expectDependencies: Map<string, { [key: string]: unknown }[]> = new Map();

  get #missingDependencies() {
    return Array.from(this.#expectDependencies.keys());
  }

  async build(config: BuildConfig, ...overrides: BuildConfig[]) {
    this.#clear();
    this.#config =
      overrides.length === 0
        ? config
        : new ConfigComposer().override(config, ...overrides);
    await this.#buildModules(this.#config);
    this.#throwErrorIfHasMissingDependencies();
    return this.#modules;
  }

  #clear() {
    this.#modules = {};
    this.#expectDependencies = new Map();
  }

  async #buildModules(config: BuildConfig) {
    if (config.modules)
      for (const [name, options] of Object.entries(config.modules)) {
        this.#resolveExpectDependencies({
          name,
          module: await this.#buildModule({ name, options }),
        });
      }
  }

  #resolveExpectDependencies({
    name,
    module,
  }: {
    name: string;
    module: unknown;
  }) {
    if (this.#expectDependencies.has(name)) {
      this.#expectDependencies.get(name)?.forEach((m) => (m[name] = module));
      this.#expectDependencies.delete(name);
    }
  }

  async #buildModule({
    name,
    options,
  }: {
    name: string;
    options: Partial<ModuleConfig>;
  }) {
    if (!options.builder) throw new Error(strings.error.missingBuilder(name));
    const result = await options.builder({
      ...options.arguments,
      dependencies: this.#dependencies(options.dependencies),
    });
    this.#modules[name] = result;
    return result;
  }

  #dependencies(dependencies: string[] | undefined) {
    if (dependencies === undefined) return undefined;
    const result: { [name: string]: unknown } = {};
    dependencies.forEach((d) =>
      d in this.#modules
        ? (result[d] = this.#modules[d])
        : this.#expectDependencies.has(d)
        ? this.#expectDependencies.get(d)?.push(result)
        : this.#expectDependencies.set(d, [result])
    );
    return result;
  }

  #throwErrorIfHasMissingDependencies() {
    if (this.#missingDependencies.length > 0)
      throw new Error(
        strings.error.missingDependencies(this.#missingDependencies)
      );
  }
}
