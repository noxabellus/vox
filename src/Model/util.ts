
import { Slate, Api, RangeRef, Selection } from "./Slate";

export function makeRangeRef (editor: Slate, selection: Selection): RangeRef | null {
    return selection? Api.rangeRef(editor, selection) : null;
}

export function updateRangeRef (newValue: RangeRef | null) {
    return (oldValue: RangeRef | null) => {
        oldValue?.unref();
        return newValue;
    };
}
