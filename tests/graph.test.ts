import { describe, expect, test } from "vitest";
import { topologicalSort } from "../src/graph";
import strings from "../src/strings";

describe(topologicalSort.name, () => {
  test("should sort a simple graph", () => {
    const graph = new Map<string, string[]>([
      ["A", ["B"]],
      ["B", ["C"]],
      ["C", []],
    ]);
    const result = topologicalSort(graph);
    expect(result).toEqual(["C", "B", "A"]);
  });

  test("should handle multiple dependencies", () => {
    const graph = new Map<string, string[]>([
      ["A", ["B", "C"]],
      ["B", []],
      ["C", []],
    ]);
    const result = topologicalSort(graph);
    expect(result).toEqual(["B", "C", "A"]);
  });

  test("should throw an error for cyclical dependencies", () => {
    const graph = new Map<string, string[]>([
      ["A", ["B"]],
      ["B", ["C"]],
      ["C", ["A"]],
    ]);
    expect(() => topologicalSort(graph)).toThrowError(
      strings.error.cyclicalDependence("A")
    );
  });

  test("should handle disconnected nodes", () => {
    const graph = new Map<string, string[]>([
      ["A", []],
      ["B", []],
      ["C", []],
    ]);
    const result = topologicalSort(graph);
    expect(result).toEqual(["A", "B", "C"]);
  });
});
