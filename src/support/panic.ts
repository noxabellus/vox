export default panic;

export function panic (message: string, ...args: any[]): never {
    console.error(message, ...args);
    console.trace(message);
    throw message;
}

export function unreachable (message?: string, ...args: any[]): never {
    panic(message? `unreachable code reached: ${message}` : "unreachable code reached", ...args);
}

export function assert (cond: boolean, message?: string, ...args: any[]): asserts cond {
    if (!cond) panic(message? `assertion failed: ${message}` : "assertion failed", ...args);
}
