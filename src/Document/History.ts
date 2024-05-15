import { Operation, Range } from "slate";


export * as History from "./History";


export type History = {
    undos: Batch[],
    redos: Batch[],
};

export type Batch = {
    operations: Operation[],
    selectionBefore: Range | null,
};


export function createHistory (undos?: Batch[], redos?: Batch[]): History {
    return {
        redos: undos || [],
        undos: redos || [],
    };
}

export function isHistory (value: any): value is History {
    return typeof value === "object"
        && Array.isArray(value.redos)
        && Array.isArray(value.undos)
        ;;
}

export function asHistory (value: any): History | undefined {
    if (isHistory(value)) return value;
}

export function canUndo (history: History): boolean {
    return history.undos.length > 0;
}

export function canRedo (history: History): boolean {
    return history.redos.length > 0;
}

export function createBatch (operations?: Operation[], selectionBefore?: Range): Batch {
    return {
        operations: operations || [],
        selectionBefore: selectionBefore || null,
    };
}

export function isBatch (value: any): value is Batch {
    return typeof value === "object"
        && Array.isArray(value.operations)
        && (value.selectionBefore === null || Range.isRange(value.selectionBefore))
        ;;
}

export function asBatch (value: any): Batch | undefined {
    if (isBatch(value)) return value;
}
