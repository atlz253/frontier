import strings from "./strings";

export function topologicalSort(graph: Map<string, string[]>): string[] {
  const result: string[] = [];
  const visited = new Set<string>();
  const temp = new Set<string>();

  const visit = (node: string) => {
    if (temp.has(node)) throw new Error(strings.error.cyclicalDependence(node));
    if (visited.has(node)) return;

    temp.add(node);
    const deps = graph.get(node) || [];
    for (const dep of deps) if (graph.has(dep)) visit(dep);

    temp.delete(node);
    visited.add(node);
    result.push(node);
  };

  for (const node of graph.keys()) if (!visited.has(node)) visit(node);

  return result;
}
