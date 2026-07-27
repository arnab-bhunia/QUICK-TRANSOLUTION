const SVG_NS = "http://www.w3.org/2000/svg";

export default class Lighting {

    constructor(layer) {

        this.layer = layer;

        this.lights = [];

        this.maxLights = 30;

    }

    /**
     * Create a bloom at a position
     */
    flash(x, y, radius = 1) {

        if (this.lights.length >= this.maxLights) {

            this.removeOldest();

        }

        const circle =
            document.createElementNS(
                SVG_NS,
                "circle"
            );

        circle.setAttribute(
            "class",
            "light-bloom"
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
            radius
        );

        this.layer.appendChild(
            circle
        );

        this.lights.push({

            element: circle,

            x,

            y,

            radius,

            opacity: 0.35,

            growth: 22,

            fade: 1.2

        });

    }

    update(delta) {

        if (!this.lights.length)
            return;

        for (

            let i =
                this.lights.length - 1;

            i >= 0;

            i--

        ) {

            const light =
                this.lights[i];

            light.opacity -=
                delta * light.fade;

            light.radius +=
                delta * light.growth;

            if (
                light.opacity <= 0
            ) {

                if (
                    light.element.parentNode
                ) {

                    light.element.parentNode.removeChild(
                        light.element
                    );

                }

                this.lights.splice(
                    i,
                    1
                );

                continue;

            }

            light.element.setAttribute(
                "opacity",
                light.opacity
            );

            light.element.setAttribute(
                "r",
                light.radius
            );

        }

    }

    removeOldest() {

        const light =
            this.lights.shift();

        if (
            light &&
            light.element.parentNode
        ) {

            light.element.parentNode.removeChild(
                light.element
            );

        }

    }

    clear() {

        this.lights.forEach(light => {

            if (
                light.element.parentNode
            ) {

                light.element.parentNode.removeChild(
                    light.element
                );

            }

        });

        this.lights = [];

    }

    destroy() {

        this.clear();

        this.layer = null;

    }

}