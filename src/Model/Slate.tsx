import { BaseEditor, Editor as SlateEditor, createEditor} from "slate";
import { ReactEditor, withReact, Slate as SlateContext } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";

import { Text } from "Document/Text";
import { Element } from "Document/Element";
import { ReactNode } from "react";
import { Document } from "Document";


export * as Slate from "./Slate";


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
    children?: ReactNode | ReactNode[],
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

export function Context({slate, children}: ContextProps) {
    return <SlateContext editor={slate} initialValue={slate.children}>
        {children}
    </SlateContext>;
}
