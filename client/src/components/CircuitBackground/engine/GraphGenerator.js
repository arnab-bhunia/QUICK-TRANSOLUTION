const DEFAULT_OPTIONS = {
  spacing: 52,
  diagonalChance: 0.35,
};

export default class GraphGenerator {
  constructor({
    width,
    height,
    spacing = DEFAULT_OPTIONS.spacing,
    diagonalChance = DEFAULT_OPTIONS.diagonalChance,
  }) {
    this.width = width;
    this.height = height;
    this.spacing = spacing;
    this.diagonalChance = diagonalChance;
  }

  generate() {
    const cols = Math.ceil(this.width / this.spacing) + 2;
    const rows = Math.ceil(this.height / this.spacing) + 2;

    const nodes = [];
    const edges = [];
    const graph = new Map();

    // --------------------------
    // Create Nodes
    // --------------------------

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const node = {
          id: `${x}-${y}`,
          x: x * this.spacing,
          y: y * this.spacing,
          neighbors: [],
        };

        nodes.push(node);
        graph.set(node.id, node);
      }
    }

    const index = (x, y) => y * cols + x;

    // --------------------------
    // Create Edges
    // --------------------------

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const current = nodes[index(x, y)];

        this.connect(current, nodes, graph, edges, x + 1, y, cols, rows);
        this.connect(current, nodes, graph, edges, x, y + 1, cols, rows);

        if (Math.random() < this.diagonalChance) {
          this.connect(
            current,
            nodes,
            graph,
            edges,
            x + 1,
            y + 1,
            cols,
            rows
          );
        }

        if (Math.random() < this.diagonalChance) {
          this.connect(
            current,
            nodes,
            graph,
            edges,
            x - 1,
            y + 1,
            cols,
            rows
          );
        }
      }
    }

    return {
      width: this.width,
      height: this.height,
      spacing: this.spacing,
      rows,
      cols,
      nodes,
      edges,
      graph,
    };
  }

  connect(current, nodes, graph, edges, x, y, cols, rows) {
    if (x < 0 || y < 0) return;
    if (x >= cols || y >= rows) return;

    const target = nodes[y * cols + x];

    if (!target) return;

    edges.push({
      from: current.id,
      to: target.id,
    });

    graph.get(current.id).neighbors.push(target.id);
    graph.get(target.id).neighbors.push(current.id);
  }

  render(svg, data) {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const SVG_NS = "http://www.w3.org/2000/svg";

    // --------------------------
    // Grid Layer
    // --------------------------

    const gridLayer = document.createElementNS(SVG_NS, "g");
    gridLayer.setAttribute("class", "circuit-grid");

    data.edges.forEach((edge) => {
      const from = data.graph.get(edge.from);
      const to = data.graph.get(edge.to);

      const line = document.createElementNS(SVG_NS, "line");

      line.setAttribute("class", "circuit-line");

      line.setAttribute("x1", from.x);
      line.setAttribute("y1", from.y);

      line.setAttribute("x2", to.x);
      line.setAttribute("y2", to.y);

      gridLayer.appendChild(line);
    });

    svg.appendChild(gridLayer);

    // --------------------------
    // Node Layer
    // --------------------------

    const nodeLayer = document.createElementNS(SVG_NS, "g");
    nodeLayer.setAttribute("class", "circuit-nodes");

    data.nodes.forEach((node) => {
      const circle = document.createElementNS(SVG_NS, "circle");

      circle.setAttribute("class", "circuit-node");

      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);

      circle.setAttribute("r", "1.5");

      node.element = circle;

      nodeLayer.appendChild(circle);
    });

    svg.appendChild(nodeLayer);
  }
}

/**
 * Creates a random walk through the graph.
 * Returns an array of segments:
 * [{ from: nodeId, to: nodeId }]
 */
export function createRandomPath(
    graph,
    {
        minSteps = 10,
        maxSteps = 22
    } = {}
) {

    const nodes = [...graph.values()];

    if (!nodes.length) {
        return [];
    }

    let current =
        nodes[
            Math.floor(
                Math.random() * nodes.length
            )
        ];

    const visited = new Set();

    const path = [];

    const totalSteps =
        Math.floor(
            Math.random() *
            (maxSteps - minSteps + 1)
        ) + minSteps;

    for (
        let i = 0;
        i < totalSteps;
        i++
    ) {

        const options =
            current.neighbors.filter(
                id => {

                    const key =
                        current.id < id
                            ? `${current.id}-${id}`
                            : `${id}-${current.id}`;

                    return !visited.has(key);

                }
            );

        if (!options.length)
            break;

        const nextId =
            options[
                Math.floor(
                    Math.random() *
                    options.length
                )
            ];

        const edgeKey =
            current.id < nextId
                ? `${current.id}-${nextId}`
                : `${nextId}-${current.id}`;

        visited.add(edgeKey);

        path.push({
            from: current.id,
            to: nextId
        });

        current =
            graph.get(nextId);

    }

    return path;

}