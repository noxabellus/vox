import { ReactNode } from "react";
import { BaseEditor, Editor as SlateEditor, createEditor, Selection, Range, Point, RangeRef } from "slate";
import { ReactEditor, withReact, Slate as SlateContext, Editable } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";

import { Document } from "Document";
import { Text } from "Document/Text";
import { Element } from "Document/Element";
import { Descendant } from "Document/hierarchy";

export * as Slate from "./Slate";
export { Selection, Range, RangeRef, Point, Editable };


declare module "slate" {
    interface CustomTypes {
        Editor: Slate,
        Element: Element,
        Text: Text,
    }
}

export type Slate = BaseEditor & ReactEditor & HistoryEditor;

export type Api = typeof SlateEditor & typeof ReactEditor & typeof HistoryEditor;

export type ContextProps = {
    slate: Slate,
    children: ReactNode | ReactNode[],
} & ContextCallbacks;

export type ContextCallbacks = {
    onChange?: (value: Descendant[]) => Promise<void> | void,
    onSelectionChange?: (selection: Selection) => Promise<void> | void,
    onValueChange?: (value: Descendant[]) => Promise<void> | void,
};

export type Action = (slate: Slate) => Promise<void> | void;


export const Api: Api = {
    ...SlateEditor,
    ...ReactEditor,
    ...HistoryEditor,
} as any;


export function createSlate(document?: Document): Slate {
    const e = withHistory(withReact(createEditor()));
    if (document) {
        e.history = document.history;
        e.children = document.content;
    }
    return e;
}

export function Context({slate, ...props}: ContextProps) {
    return <SlateContext editor={slate} initialValue={slate.children} {...props} />;
}




export function showPoint (point: Point) {
    return `${point.path.join(".")}:${point.offset}`;
}

export function showSelection (selection?: Range | null) {
    if (!selection) return "none";
    const anchor = showPoint(selection.anchor);
    const focus = showPoint(selection.focus);

    if (anchor == focus) return anchor;
    else return `${anchor} -> ${focus}`;
}
