import React, { ReactNode, createContext, useContext } from "react";

import RangeOf from "Support/RangeOf";
import { assert, unreachable } from "Support/panic";
import * as remote from "Support/remote";

import { Editor } from "./Editor";
import { Mode, isEditorMode } from "./Mode";
import { UserSettings } from "./UserSettings";


export * as App from "./App";


export type App = {
    mode: Mode,
    editors: Editor[],
    userSettings: UserSettings,
    lockIO: boolean,
};

export type ProviderProps = {
    app: App,
    dispatch: Dispatch,
    children?: ReactNode | ReactNode[],
};

export type Dispatch = (action: Action) => Promise<void>;

export type Action
    = EditorAction
    | SwitchMode
    | SetLockIO
    | Close
    ;

export type EditorAction = {
    type: "editor-action",
    value: {
        editorId: Editor.Id,
        editorAction: Editor.Action,
    },
};

export type SwitchMode = {
    type: "switch-mode",
    value: Mode,
};

export type SetLockIO = {
    type: "set-lock-io",
    value: boolean,
};

export type Close = {
    type: "close",
    value?: Editor.Id,
};


export type ActionName = Action["type"];
export const ActionNames = RangeOf<ActionName>()("editor-action", "switch-mode", "set-lock-io", "close");

export function isAction (action: Action): action is Action {
    return ActionNames.includes(action.type as ActionName);
}

export function useState (instance: Instance): [App, Dispatch] {
    const [app, updateApp] = React.useState<App>(instance.model);

    async function appDispatch (action: Action) {
        instance.model = await reducer(instance.model, action);
        updateApp(instance.model);
    }

    return [app, appDispatch];
}


const AppCtx = createContext<App>(null as any);
const DispatchCtx = createContext<Dispatch>(null as any);

export function useApp (): [App, Dispatch] {
    const app = useContext(AppCtx);
    const dispatch = useContext(DispatchCtx);

    return [app, dispatch] as const;
}

export function Provider ({app, dispatch, children}: ProviderProps) {
    return <AppCtx.Provider value={app}>
        <DispatchCtx.Provider value={dispatch}>
            {children}
        </DispatchCtx.Provider>
    </AppCtx.Provider>;
}


export type Instance = {
    model: App
};


export async function reducer (state: App, action: Action): Promise<App> {
    const out = {...state};

    switch (action.type) {
        case "editor-action": {
            const editorIndex = state.editors.findIndex(editor => editor.id === action.value.editorId);
            assert(editorIndex >= 0, "Invalid editor id for editor action", action.value);
            out.editors[editorIndex] = await Editor.reducer(out.editors[editorIndex], action.value.editorAction);
        } break;

        case "switch-mode": {
            const mode = out.mode = action.value;

            if (isEditorMode(mode)) {
                const editor = out.editors.find(editor => editor.id === mode.editorId) || unreachable("Editor not found", mode);
                delete editor.width;
            }
        } break;

        case "set-lock-io": {
            out.lockIO = action.value;
        } break;

        case "close": {
            // TODO: save interrupts

            if (action.value !== undefined) {
                const editorIndex = state.editors.findIndex(editor => editor.id === action.value);
                assert(editorIndex >= 0, "Invalid editor id for close action", action.value);
                out.editors = out.editors.filter(editor => editor.id !== action.value);

                switch (out.mode.name) {
                    case "multi-editor": {
                        out.mode.editorIds = out.mode.editorIds.filter(id => id !== action.value);

                        if (out.mode.editorIds.length === 0) {
                            return reducer(out, {type: "switch-mode", value: {name: "splash"}});
                        } else if (out.mode.editorIds.length === 1) {
                            return reducer(out, {type: "switch-mode", value: {name: "editor", editorId: out.mode.editorIds[0]}});
                        }
                    } break;

                    case "editor": {
                        if (out.mode.editorId === action.value) {
                            if (out.editors.length === 0) {
                                return reducer(out, {type: "switch-mode", value: {name: "splash"}});
                            } else {
                                return reducer(out, {type: "switch-mode", value: {name: "editor", editorId: out.editors[0].id}});
                            }
                        }
                    } break;

                    default: unreachable("Invalid mode for close action", out.mode);
                }
            } else {
                remote.app.quit();
            }
        } break;

        default: unreachable("Invalid app action", action);
    }

    return out;
}
