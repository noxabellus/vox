import { History } from "./History";
import { Style } from "./Style";
import { Descendant } from "./hierarchy";


export * as Document from "./index";


export type Document = {
    title: string,
    style: Style,
    content: Descendant[],
    history: History,
};


export function createDocument (title?: string, style?: Style, content?: Descendant[], history?: History): Document {
    return {
        title: title || "untitled",
        style: style || {},
        content: content || [],
        history: history || History.createHistory(),
    };
}
