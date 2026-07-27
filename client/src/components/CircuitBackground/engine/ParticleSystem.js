const SVG_NS = "http://www.w3.org/2000/svg";

export default class ParticleSystem {

    constructor(layer) {

        this.layer = layer;

        this.particles = [];

        this.maxParticles = 250;

    }

    /**
     * Create sparks at a position
     */
    emit(x, y, amount = 6) {

        for (let i = 0; i < amount; i++) {

            if (
                this.particles.length >=
                this.maxParticles
            ) {

                this.removeOldest();

            }

            const circle =
                document.createElementNS(
                    SVG_NS,
                    "circle"
                );

            circle.setAttribute(
                "class",
                "particle"
            );

            circle.setAttribute(
                "cx",
                x
            );

            circle.setAttribute(
                "cy",
                y
            );

            circle.setAttribute(
                "r",
                1.2 + Math.random()
            );

            this.layer.appendChild(
                circle
            );

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                25 +
                Math.random() *
                70;

            this.particles.push({

                element: circle,

                x,

                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                life: 1,

                decay:
                    1.2 +
                    Math.random() *
                    0.6

            });

        }

    }

    update(delta) {

        if (
            !this.particles.length
        )
            return;

        for (
            let i =
                this.particles.length - 1;
            i >= 0;
            i--
        ) {

            const p =
                this.particles[i];

            p.life -=
                delta *
                p.decay;

            if (
                p.life <= 0
            ) {

                if (
                    p.element.parentNode
                ) {

                    p.element.parentNode.removeChild(
                        p.element
                    );

                }

                this.particles.splice(
                    i,
                    1
                );

                continue;

            }

            p.x +=
                p.vx * delta;

            p.y +=
                p.vy * delta;

            p.vx *= 0.96;

            p.vy *= 0.96;

            p.element.setAttribute(
                "cx",
                p.x
            );

            p.element.setAttribute(
                "cy",
                p.y
            );

            p.element.setAttribute(
                "opacity",
                p.life
            );

            p.element.setAttribute(
                "r",
                Math.max(
                    0.3,
                    p.life * 1.8
                )
            );

        }

    }

    removeOldest() {

        const particle =
            this.particles.shift();

        if (
            particle &&
            particle.element &&
            particle.element.parentNode
        ) {

            particle.element.parentNode.removeChild(
                particle.element
            );

        }

    }

    clear() {

        this.particles.forEach(
            particle => {

                if (
                    particle.element.parentNode
                ) {

                    particle.element.parentNode.removeChild(
                        particle.element
                    );

                }

            }
        );

        this.particles = [];

    }

    destroy() {

        this.clear();

        this.layer = null;

    }

}