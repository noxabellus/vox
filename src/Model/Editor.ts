import { PathLike } from "original-fs";
import { createContext, useContext, useMemo } from "react";

import { Document } from "Document";

import { Slate, createSlate } from "./Slate";
import { App, useApp } from "./App";
import RangeOf from "Support/RangeOf";
import { assert, unreachable } from "Support/panic";


export * as Editor from "./Editor";


export const MIN_WIDTH = 100;


export type Id = number;

export type Editor = {
    id: Id,
    slate: Slate,
    filePath?: PathLike,
    title: string,
    width?: number,
};

export type Dispatch = (action: Action) => Promise<void>;

export type Action
    = SetTitle
    | SetFilePath
    | SlateAction
    | Resize
    ;

export type SetTitle = {
    type: "set-title",
    value: string,
};

export type SetFilePath = {
    type: "set-file-path",
    value: PathLike,
};

export type SlateAction = {
    type: "slate-action",
    value: Slate.Action,
};

export type Resize = {
    type: "resize",
    value: number,
};


export type ActionName = Action["type"];
export const ActionNames = RangeOf<ActionName>()("set-title", "set-file-path", "slate-action", "resize");

export function isAction (action: Action): action is Action {
    return ActionNames.includes(action.type as ActionName);
}


export function createEditor (id: number, filePath?: PathLike, document?: Document): Editor {
    return {
        id,
        filePath,
        title: document?.title || "untitled",
        slate: createSlate(document),
    };
}


const IdCtx = createContext<Id>(null as any);

export const IdProvider = IdCtx.Provider;

export const useId = () => useContext(IdCtx);


export function deriveEditorFromIdAndApp (editorId: Editor.Id, app: App, appDispatch: App.Dispatch): readonly [Editor, Dispatch] {
    return useMemo(() => {
        const editor = app.editors.find(editor => editor.id === editorId);
        assert(editor !== undefined, "Editor not found in `deriveEditorFromId`", editorId);

        return [editor, (editorAction: Action) => appDispatch({type: "editor-action", value: {editorId, editorAction}})];
    }, [editorId, app, appDispatch]);
}

export function deriveEditorFromId (editorId: Editor.Id): readonly [Editor, Dispatch, App, App.Dispatch] {
    const [app, appDispatch] = useApp();
    return [...deriveEditorFromIdAndApp(editorId, app, appDispatch), app, appDispatch];
}

export function deriveEditorFromApp (app: App, appDispatch: App.Dispatch): readonly [Editor, Dispatch] {
    const id = useId();
    return deriveEditorFromIdAndApp(id, app, appDispatch);
}

export function useEditor (): readonly [Editor, Dispatch, App, App.Dispatch] {
    const [app, appDispatch] = useApp();
    return [...deriveEditorFromApp(app, appDispatch), app, appDispatch];
}



export async function reducer (state: Editor, action: Action): Promise<Editor> {
    const out = {...state};

    switch (action.type) {
        case "set-title": {
            out.title = action.value;
        } break;

        case "set-file-path": {
            out.filePath = action.value;
        } break;

        case "slate-action": {
            await action.value(out.slate);
        } break;

        case "resize": {
            out.width = Math.max(MIN_WIDTH, action.value);
        } break;

        default: unreachable("Invalid Editor Action", action);
    }

    return out;
}
