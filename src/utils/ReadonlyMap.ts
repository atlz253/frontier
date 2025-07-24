export class ReadonlyMap<K, V> {
  #map;

  constructor(...args: ConstructorParameters<typeof Map<K, V>>) {
    this.#map = new Map(...args);
  }

  get(key: K): V | undefined {
    return this.#map.get(key);
  }
}
