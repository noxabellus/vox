import { BaseEditor, Editor as SlateEditor, createEditor} from "slate";
import { ReactEditor, Slate, withReact } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";

import { Text } from "Doc/Text";
import { Element } from "Doc/Element";
import { useState } from "react";


export { Slate as SlateContext } from "slate-react";

export type Editor = BaseEditor & ReactEditor & HistoryEditor;

export function useSlate(): Editor {
    return useState(() => withHistory(withReact(createEditor())))[0];
}

export type Api = BaseEditor & ReactEditor & typeof HistoryEditor;

export const Api: Api = {
    ...SlateEditor,
    ...ReactEditor,
    ...HistoryEditor,
} as any;

export default Slate;


declare module "slate" {
    interface CustomTypes {
        Editor: Editor,
        Element: Element,
        Text: Text,
    }
}
