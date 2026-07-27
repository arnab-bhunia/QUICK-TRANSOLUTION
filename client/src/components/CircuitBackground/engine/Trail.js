const SVG_NS = "http://www.w3.org/2000/svg";

export default class Trail {

    constructor(layer) {

        this.layer = layer;

        this.maxPoints = 50;

        this.points = [];

        this.path =
            document.createElementNS(
                SVG_NS,
                "path"
            );

        this.path.setAttribute(
            "class",
            "trail-path"
        );

        this.layer.appendChild(
            this.path
        );

    }

    addPoint(x, y) {

        this.points.unshift({
            x,
            y
        });

        if (
            this.points.length >
            this.maxPoints
        ) {

            this.points.pop();

        }

        this.render();

    }

    render() {

        if (
            this.points.length < 2
        ) {

            this.path.setAttribute(
                "d",
                ""
            );

            return;

        }

        let d = `M ${this.points[0].x} ${this.points[0].y}`;

        for (
            let i = 1;
            i < this.points.length;
            i++
        ) {

            const previous =
                this.points[i - 1];

            const current =
                this.points[i];

            const midX =
                (previous.x + current.x) /
                2;

            const midY =
                (previous.y + current.y) /
                2;

            d +=
                ` Q ${previous.x} ${previous.y} ${midX} ${midY}`;

        }

        this.path.setAttribute(
            "d",
            d
        );

        this.updateAppearance();

    }

    updateAppearance() {

        const opacity =
            Math.min(
                1,
                this.points.length /
                this.maxPoints
            );

        this.path.style.opacity =
            opacity;

    }

    clear() {

        this.points.length = 0;

        this.path.setAttribute(
            "d",
            ""
        );

    }

    destroy() {

        if (
            this.path &&
            this.path.parentNode
        ) {

            this.path.parentNode.removeChild(
                this.path
            );

        }

        this.points.length = 0;

        this.path = null;

        this.layer = null;

    }

}