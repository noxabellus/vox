export default function panic (message: string, ...args: any[]): never {
    console.error(message, ...args);
    console.trace(message);
    throw message;
}
