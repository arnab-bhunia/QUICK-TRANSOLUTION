import Pulse from "./Pulse";
import Trail from "./Trail";
import ParticleSystem from "./ParticleSystem";
import Scheduler from "./Scheduler";
import Lighting from "./Lighting";

const SVG_NS = "http://www.w3.org/2000/svg";

const MAX_PULSES = 4;

export default class CircuitEngine {
    constructor({ svg, graph }) {
        this.svg = svg;
        this.graph = graph;

        this.running = false;
        this.animationFrame = null;
        this.lastFrame = 0;
        this.delta = 0;
        this.pulses = [];

        this.scheduler = new Scheduler({
            minDelay: 12000,
            maxDelay: 32000,
        });

        this.trail = new Trail(svg);
        this.particles = new ParticleSystem(svg);
        this.lighting = new Lighting(svg);

        this.layers = {};

        this.handleVisibility = this.handleVisibility.bind(this);
        this.update = this.update.bind(this);

        this.buildSVG();

        document.addEventListener(
            "visibilitychange",
            this.handleVisibility
        );
    }

    /* ------------------------------------------------------------------ */
    /*  Lifecycle                                                          */
    /* ------------------------------------------------------------------ */

    start() {
        if (this.running) return;
        this.running = true;
        this.lastFrame = performance.now();
        this.scheduleNextPulse();
        this.tick(this.lastFrame);
    }

    stop() {
        this.running = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    destroy() {
        this.stop();

        document.removeEventListener(
            "visibilitychange",
            this.handleVisibility
        );

        this.pulses.forEach((p) => p.destroy());
        this.pulses.length = 0;

        this.trail.destroy();
        this.particles.destroy();
        this.lighting.destroy();
        this.scheduler.destroy();

        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }

        this.svg = null;
        this.graph = null;
        this.layers = {};
    }

    /* ------------------------------------------------------------------ */
    /*  Animation Loop                                                     */
    /* ------------------------------------------------------------------ */

    tick(now) {
        if (!this.running) return;

        const rawDelta = (now - this.lastFrame) / 1000;
        this.lastFrame = now;

        // Clamp delta to avoid spiral-of-death after tab switches
        this.delta = Math.min(rawDelta, 0.05);

        this.update(this.delta, now);

        this.animationFrame = requestAnimationFrame((t) => this.tick(t));
    }

    /* ------------------------------------------------------------------ */
    /*  Main Update                                                        */
    /* ------------------------------------------------------------------ */

    update(delta, time) {
        // 1. Scheduler — spawn new pulses
        if (this.scheduler.update(delta)) {
            this.spawnPulse();
        }

        // 2. Update each active pulse
        for (let i = this.pulses.length - 1; i >= 0; i--) {
            const pulse = this.pulses[i];

            if (pulse.isFinished()) {
                pulse.destroy();
                this.pulses.splice(i, 1);
                continue;
            }

            pulse.tick(delta, time);
        }

        // Ensure at least one pulse is always active
        if (this.pulses.length === 0) {
            this.scheduleNextPulse();
            this.spawnPulse();
        }

        // 3. Update sub-systems
        this.lighting.update(delta);
        this.particles.update(delta);
    }

    /* ------------------------------------------------------------------ */
    /*  Pulse Management                                                   */
    /* ------------------------------------------------------------------ */

    scheduleNextPulse() {
        this.scheduler.reset();
    }

    spawnPulse() {
        if (this.pulses.length >= MAX_PULSES) {
            // Recycle oldest pulse
            const oldest = this.pulses.shift();
            oldest.destroy();
        }

        const pulse = new Pulse({
            layer: this.layers.pulse,
            graph: this.graph,
            lighting: this.lighting,
            trail: this.trail,
            particles: this.particles,
        });

        pulse.start();
        this.pulses.push(pulse);
    }

    /* ------------------------------------------------------------------ */
    /*  Visibility                                                         */
    /* ------------------------------------------------------------------ */

    handleVisibility() {
        if (document.hidden) {
            this.stop();
        } else {
            this.lastFrame = performance.now();
            this.start();
        }
    }

    /* ------------------------------------------------------------------ */
    /*  SVG Build                                                          */
    /* ------------------------------------------------------------------ */

    buildSVG() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }

        this.createDefinitions();

        this.layers.grid = this.createLayer("circuit-grid");
        this.layers.trail = this.createLayer("circuit-trail-layer");
        this.layers.light = this.createLayer("circuit-light-layer");
        this.layers.pulse = this.createLayer("circuit-pulse-layer");
        this.layers.particles = this.createLayer("circuit-particle-layer");

        this.renderGrid();
    }

    createDefinitions() {
        const defs = document.createElementNS(SVG_NS, "defs");

        // --- Glow filter ---
        const filter = document.createElementNS(SVG_NS, "filter");
        filter.setAttribute("id", "circuitGlow");
        filter.setAttribute("x", "-300%");
        filter.setAttribute("y", "-300%");
        filter.setAttribute("width", "300%");
        filter.setAttribute("height", "300%");

        const blur = document.createElementNS(SVG_NS, "feGaussianBlur");
        blur.setAttribute("stdDeviation", "4");
        blur.setAttribute("result", "blur");

        const merge = document.createElementNS(SVG_NS, "feMerge");
        const node1 = document.createElementNS(SVG_NS, "feMergeNode");
        node1.setAttribute("in", "blur");
        const node2 = document.createElementNS(SVG_NS, "feMergeNode");
        node2.setAttribute("in", "SourceGraphic");

        merge.appendChild(node1);
        merge.appendChild(node2);
        filter.appendChild(blur);
        filter.appendChild(merge);
        defs.appendChild(filter);

        this.svg.appendChild(defs);
    }

    createLayer(className) {
        const layer = document.createElementNS(SVG_NS, "g");
        layer.setAttribute("class", className);
        this.svg.appendChild(layer);
        return layer;
    }

    renderGrid() {
        this.graph.edges.forEach((edge) => {
            const from = this.graph.graph.get(edge.from);
            const to = this.graph.graph.get(edge.to);

            const line = document.createElementNS(SVG_NS, "line");
            line.setAttribute("class", "circuit-line");
            line.setAttribute("x1", from.x);
            line.setAttribute("y1", from.y);
            line.setAttribute("x2", to.x);
            line.setAttribute("y2", to.y);

            this.layers.grid.appendChild(line);
        });

        this.graph.nodes.forEach((node) => {
            const circle = document.createElementNS(SVG_NS, "circle");
            circle.setAttribute("class", "circuit-node");
            circle.setAttribute("cx", node.x);
            circle.setAttribute("cy", node.y);
            circle.setAttribute("r", "1.5");

            node.element = circle;

            this.layers.grid.appendChild(circle);
        });
    }
}
