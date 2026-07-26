const MAX_RETRIES = 25;

/**
 * Builds an adjacency graph from SVG nodes + edges.
 */
export function buildGraph(nodes, edges) {
  const map = new Map();

  nodes.forEach((node) => {
    map.set(node.id, {
      ...node,
      neighbors: [],
    });
  });

  edges.forEach((edge) => {
    map.get(edge.from.id).neighbors.push(edge.to.id);
    map.get(edge.to.id).neighbors.push(edge.from.id);
  });

  return map;
}

/**
 * Picks a random node.
 */
export function randomNode(graph) {
  const values = [...graph.values()];
  return values[Math.floor(Math.random() * values.length)];
}

/**
 * Random path generator.
 */
export function createRandomPath(
  graph,
  {
    minSteps = 8,
    maxSteps = 18,
    branchChance = 0.10,
  } = {}
) {
  const targetSteps =
    minSteps +
    Math.floor(Math.random() * (maxSteps - minSteps + 1));

  let start = randomNode(graph);

  let retries = 0;

  while (
    start.neighbors.length < 2 &&
    retries < MAX_RETRIES
  ) {
    start = randomNode(graph);
    retries++;
  }

  const visitedEdges = new Set();

  const path = [];

  let current = start.id;

  for (let i = 0; i < targetSteps; i++) {
    const node = graph.get(current);

    if (!node) break;

    const options = node.neighbors.filter((next) => {
      const key =
        current < next
          ? `${current}-${next}`
          : `${next}-${current}`;

      return !visitedEdges.has(key);
    });

    if (options.length === 0) break;

    const next =
      options[Math.floor(Math.random() * options.length)];

    const edgeKey =
      current < next
        ? `${current}-${next}`
        : `${next}-${current}`;

    visitedEdges.add(edgeKey);

    path.push({
      from: current,
      to: next,
      branch: Math.random() < branchChance,
    });

    current = next;
  }

  return path;
}

export function randomDelay(min = 15000, max = 40000) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}