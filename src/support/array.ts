export function arrayFromFunction<T> (length: number, fn: (index: number) => T): T[] {
    return Array(length).fill(0).map((_, index) => fn(index));
};
