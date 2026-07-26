import Pulse from "./Pulse";
import Trail from "./Trail";
import ParticleSystem from "./ParticleSystem";
import Scheduler from "./Scheduler";
import Lighting from "./Lighting";

const SVG_NS = "http://www.w3.org/2000/svg";

export default class CircuitEngine {
    constructor({
        svg,
        graph
    }) {

        this.svg = svg;
        this.graph = graph;

        this.running = false;

        this.animationFrame = null;

        this.lastFrame = 0;

        this.delta = 0;

        this.pulses = [];

        this.scheduler = new Scheduler();

        this.trail = new Trail(svg);

        this.particles = new ParticleSystem(svg);

        this.lighting = new Lighting(svg);

        this.layers = {};

        this.handleVisibility =
            this.handleVisibility.bind(this);

        this.update =
            this.update.bind(this);

        this.buildSVG();

        document.addEventListener(
            "visibilitychange",
            this.handleVisibility
        );
    }

    buildSVG() {

        while (this.svg.firstChild) {
            this.svg.removeChild(
                this.svg.firstChild
            );
        }

        this.createDefinitions();

        this.layers.grid =
            this.createLayer("circuit-grid");

        this.layers.trail =
            this.createLayer("circuit-trail-layer");

        this.layers.light =
            this.createLayer("circuit-light-layer");

        this.layers.pulse =
            this.createLayer("circuit-pulse-layer");

        this.layers.particles =
            this.createLayer("circuit-particle-layer");

        this.renderGrid();
    }

    createDefinitions() {

        const defs =
            document.createElementNS(
                SVG_NS,
                "defs"
            );

        const filter =
            document.createElementNS(
                SVG_NS,
                "filter"
            );

        filter.setAttribute(
            "id",
            "circuitGlow"
        );

        filter.setAttribute(
            "x",
            "-300%"
        );

        filter.setAttribute(
            "y",
            "-300%"
        );

        filter.setAttribute(
            "width",
            "600%"
        );

        filter.setAttribute(
            "height",
            "600%"
        );

        const blur =
            document.createElementNS(
                SVG_NS,
                "feGaussianBlur"
            );

        blur.setAttribute(
            "stdDeviation",
            "4"
        );

        blur.setAttribute(
            "result",
            "blur"
        );

        const merge =
            document.createElementNS(
                SVG_NS,
                "feMerge"
            );

        const node1 =
            document.createElementNS(
                SVG_NS,
                "feMergeNode"
            );

        node1.setAttribute(
            "in",
            "blur"
        );

        const node2 =
            document.createElementNS(
                SVG_NS,
                "feMergeNode"
            );

        node2.setAttribute(
            "in",
            "SourceGraphic"
        );

        merge.appendChild(node1);
        merge.appendChild(node2);

        filter.appendChild(blur);
        filter.appendChild(merge);

        defs.appendChild(filter);

        this.svg.appendChild(defs);
    }

    createLayer(className) {

        const layer =
            document.createElementNS(
                SVG_NS,
                "g"
            );

        layer.setAttribute(
            "class",
            className
        );

        this.svg.appendChild(layer);

        return layer;
    }

    renderGrid() {

        this.graph.edges.forEach(edge => {

            const from =
                this.graph.graph.get(edge.from);

            const to =
                this.graph.graph.get(edge.to);

            const line =
                document.createElementNS(
                    SVG_NS,
                    "line"
                );

            line.setAttribute(
                "class",
                "circuit-line"
            );

            line.setAttribute(
                "x1",
                from.x
            );

            line.setAttribute(
                "y1",
                from.y
            );

            line.setAttribute(
                "x2",
                to.x
            );

            line.setAttribute(
                "y2",
                to.y
            );

            this.layers.grid.appendChild(
                line
            );

        });

        this.graph.nodes.forEach(node => {

            const circle =
                document.createElementNS(
                    SVG_NS,
                    "circle"
                );

            circle.setAttribute(
                "class",
                "circuit-node"
            );

            circle.setAttribute(
                "cx",
                node.x
            );

            circle.setAttribute(
                "cy",
                node.y
            );

            circle.setAttribute(
                "r",
                "1.5"
            );

            node.element = circle;

            this.layers.grid.appendChild(
                circle
            );

        });

    }