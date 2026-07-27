export default class Scheduler {

    constructor({

        minDelay = 15000,

        maxDelay = 40000

    } = {}) {

        this.minDelay = minDelay;

        this.maxDelay = maxDelay;

        this.timer = this.randomDelay();

        this.enabled = true;

    }

    randomDelay() {

        return (
            this.minDelay +
            Math.random() *
            (this.maxDelay - this.minDelay)
        );

    }

    update(delta) {

        if (!this.enabled) {

            return false;

        }

        this.timer -= delta * 1000;

        if (this.timer <= 0) {

            // Add jitter (±20% of random range)
            const jitter = (this.maxDelay - this.minDelay) * 0.2;
            this.timer = this.randomDelay() + (Math.random() - 0.5) * jitter;

            return true;

        }

        return false;

    }

    reset() {

        this.timer = this.randomDelay();

    }

    pause() {

        this.enabled = false;

    }

    resume() {

        this.enabled = true;

    }

    forceTrigger() {

        this.timer = 0;

    }

    setDelay(minDelay, maxDelay) {

        this.minDelay = minDelay;

        this.maxDelay = maxDelay;

        this.reset();

    }

    getRemainingTime() {

        return Math.max(0, this.timer);

    }

    destroy() {

        this.enabled = false;

    }

}