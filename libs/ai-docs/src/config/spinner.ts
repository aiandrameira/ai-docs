import ora, { Ora } from "ora";

export interface SpinnerRepository {
    start(): void;
    succeed(text?: string): void;
    fail(text?: string): void;
    stop(): void;
}

class Spinner implements SpinnerRepository {
    private readonly instance: Ora;

    constructor(text: string) {
        this.instance = ora(text);
    }

    start(): void {
        this.instance.start();
    }

    succeed(text?: string): void {
        this.instance.succeed(text);
    }

    fail(text?: string): void {
        this.instance.fail(text);
    }

    stop(): void {
        this.instance.stop();
    }
}

export function spinner(text: string): SpinnerRepository {
    return new Spinner(text);
}
