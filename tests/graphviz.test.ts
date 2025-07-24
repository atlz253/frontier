import { Graph } from "graphlib";
import { write } from "graphlib-dot";
import { instance } from "@viz-js/viz";
import { describe, expect, test } from "vitest";

describe("graphviz", () => {
  test("JSON to DOT language", () => {
    const obj = {
      a: {},
      b: {
        dependencies: ["a"],
      },
      c: {
        dependencies: ["a", "b"],
      },
    };
    const graph = new Graph();
    for (const [name, options] of Object.entries(obj)) {
      graph.setNode(name);
      if ("dependencies" in options)
        options.dependencies.forEach((d) => graph.setEdge(name, d));
    }
    expect(write(graph)).toMatchSnapshot();
  });

  test("DOT language to SVG", async () => {
    const viz = await instance();
    const svg = viz.renderString(
      `
      digraph G {
        A -> B;
        B -> C;
        A -> C;
        C -> D;
      }
    `,
      { format: "svg" }
    );
    await expect(svg).toMatchFileSnapshot("__snapshots__/graphviz.test.ts.svg");
  });
});
