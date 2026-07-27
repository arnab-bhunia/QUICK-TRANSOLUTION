import { createRandomPath } from "./GraphGenerator";

const SVG_NS = "http://www.w3.org/2000/svg";

const DEFAULTS = {
    minSpeed: 260,
    maxSpeed: 620,
    coreRadius: 1.2,
    glowRadius: 1.3,
    haloRadius: 1.5
};

export default class Pulse {

    constructor({
    layer,
    graph,
    lighting,
    trail,
    particles
}){

        this.layer = layer;

        this.graph = graph;

        this.lighting = lighting;
        this.trail = trail;
        this.particles = particles;

        this.path = [];

        this.segmentIndex = 0;

        this.progress = 0;

        this.finished = false;

        this.speed =
            DEFAULTS.minSpeed +
            Math.random() *
            (DEFAULTS.maxSpeed -
                DEFAULTS.minSpeed);

        this.position = {
            x: 0,
            y: 0
        };

        this.createElements();

    }

    createElements() {

        this.group =
            document.createElementNS(
                SVG_NS,
                "g"
            );

        this.group.setAttribute(
            "class",
            "pulse-group"
        );

        this.group.setAttribute(
            "filter",
            "url(#circuitGlow)"
        );

        this.halo =
            document.createElementNS(
                SVG_NS,
                "circle"
            );

        this.halo.setAttribute(
            "class",
            "pulse-halo"
        );

        this.halo.setAttribute(
            "r",
            DEFAULTS.haloRadius
        );

        this.glow =
            document.createElementNS(
                SVG_NS,
                "circle"
            );

        this.glow.setAttribute(
            "class",
            "pulse-glow"
        );

        this.glow.setAttribute(
            "r",
            DEFAULTS.glowRadius
        );

        this.core =
            document.createElementNS(
                SVG_NS,
                "circle"
            );

        this.core.setAttribute(
            "class",
            "pulse-core"
        );

        this.core.setAttribute(
            "r",
            DEFAULTS.coreRadius
        );

        this.group.appendChild(
            this.halo
        );

        this.group.appendChild(
            this.glow
        );

        this.group.appendChild(
            this.core
        );

        this.layer.appendChild(
            this.group
        );

    }

    start() {

        this.path =
            createRandomPath(
                this.graph.graph
            );

        this.segmentIndex = 0;

        this.progress = 0;

        this.finished = false;

        if (!this.path.length) {

            this.finished = true;

            return;

        }

        const first =
            this.path[0];

        const node =
            this.graph.graph.get(
                first.from
            );

        this.position.x = node.x;

        this.position.y = node.y;

        this.render();

        if (this.trail) {

        this.trail.addPoint(
        this.position.x,
        this.position.y
    );

}

    }

    render() {

        this.halo.setAttribute(
            "cx",
            this.position.x
        );

        this.halo.setAttribute(
            "cy",
            this.position.y
        );

        this.glow.setAttribute(
            "cx",
            this.position.x
        );

        this.glow.setAttribute(
            "cy",
            this.position.y
        );

        this.core.setAttribute(
            "cx",
            this.position.x
        );

        this.core.setAttribute(
            "cy",
            this.position.y
        );

    }
        update(delta) {

        if (this.finished) {
            return;
        }

        const segment =
            this.path[this.segmentIndex];

        if (!segment) {

            this.finished = true;

            return;

        }

        const from =
            this.graph.graph.get(
                segment.from
            );

        const to =
            this.graph.graph.get(
                segment.to
            );

        if (!from || !to) {

            this.finished = true;

            return;

        }

        const dx =
            to.x - from.x;

        const dy =
            to.y - from.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance === 0) {

            this.segmentIndex++;

            return;

        }

        this.progress +=
            (this.speed * delta) /
            distance;

        if (this.progress >= 1) {

            this.progress -= 1;

            this.segmentIndex++;

            this.flashNode(to);

            if (
                this.segmentIndex >=
                this.path.length
            ) {

                this.finished = true;

                return;

            }

        }

        const eased =
            this.easeInOut(
                this.progress
            );

        this.position.x =
            from.x +
            dx * eased;

        this.position.y =
            from.y +
            dy * eased;

        this.render();

        // Record trail point during movement
        if (this.trail) {
            this.trail.addPoint(
                this.position.x,
                this.position.y
            );
        }

    }

    easeInOut(t) {

        return (
            0.5 -
            Math.cos(
                Math.PI * t
            ) / 2
        );

    }

    flashNode(node) {

        if (!node.element)
            return;

        node.element.classList.add(
            "active"
        );
if (this.lighting) {

    this.lighting.flash(
        node.x,
        node.y,
        18
    );

}
        if (this.particles) {

    this.particles.emit(
        node.x,
        node.y,
        5
    );

}

        clearTimeout(
            node.flashTimer
        );

        node.flashTimer =
            setTimeout(() => {

                node.element.classList.remove(
                    "active"
                );

            }, 160);

    }

    isFinished() {

        return this.finished;

    }

        /**
     * Replace the current path.
     * Used for branching or restarting.
     */
    setPath(path = []) {

        this.path = path;

        this.segmentIndex = 0;

        this.progress = 0;

        this.finished = path.length === 0;

        if (!this.finished) {

            const first =
                this.graph.graph.get(
                    path[0].from
                );

            if (first) {

                this.position.x = first.x;
                this.position.y = first.y;

                this.render();

            }

        }

    }

    /**
     * Change pulse speed dynamically.
     */
    setSpeed(speed) {

        if (
            Number.isFinite(speed) &&
            speed > 0
        ) {

            this.speed = speed;

        }

    }

    /**
     * Current pulse position.
     */
    getPosition() {

        return {
            x: this.position.x,
            y: this.position.y
        };

    }

    /**
     * Current segment index.
     */
    getSegmentIndex() {

        return this.segmentIndex;

    }

    /**
     * Remaining segments.
     */
    getRemainingSegments() {

        return Math.max(
            0,
            this.path.length -
            this.segmentIndex
        );

    }

    /**
     * Pulse completion percentage.
     */
    getProgress() {

        if (!this.path.length)
            return 1;

        return (
            this.segmentIndex +
            this.progress
        ) / this.path.length;

    }

    /**
     * Creates a tiny breathing animation.
     * Makes the pulse feel alive.
     */
    animateAppearance(time) {

        const glowScale =
            1 +
            Math.sin(time * 0.008) * 0.12;

        const haloScale =
            1 +
            Math.sin(time * 0.006) * 0.18;

        this.glow.setAttribute(
            "transform",
            `translate(${this.position.x} ${this.position.y})
             scale(${glowScale})
             translate(${-this.position.x} ${-this.position.y})`
        );

        this.halo.setAttribute(
            "transform",
            `translate(${this.position.x} ${this.position.y})
             scale(${haloScale})
             translate(${-this.position.x} ${-this.position.y})`
        );

    }

    /**
     * Called every animation frame.
     * Safe even after destroy().
     */
    tick(delta, time) {

        if (this.finished)
            return;

        this.update(delta);

        this.animateAppearance(time);

    }
        /**
     * Reset the pulse to its initial state.
     */
    reset() {

        this.segmentIndex = 0;

        this.progress = 0;

        this.finished = false;

        if (this.path.length) {

            const first =
                this.graph.graph.get(
                    this.path[0].from
                );

            if (first) {

                this.position.x = first.x;
                this.position.y = first.y;

                this.render();

            }

        }

    }

    /**
     * Returns true if the pulse has reached
     * the end of its current path.
     */
    hasFinished() {

        return this.finished;

    }

    /**
     * Remove every SVG element created
     * by this pulse.
     */
    destroy() {

        this.finished = true;

        if (
            this.group &&
            this.group.parentNode
        ) {

            this.group.parentNode.removeChild(
                this.group
            );

        }

        this.path.length = 0;

        this.segmentIndex = 0;

        this.progress = 0;

        this.position.x = 0;
        this.position.y = 0;

        this.group = null;
        this.core = null;
        this.glow = null;
        this.halo = null;

        this.layer = null;
        this.graph = null;
        this.lighting = null;

    }

}