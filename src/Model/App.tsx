import { ReactNode, createContext, useContext } from "react";
import { Editor } from "./Editor";
import { Mode } from "./Mode";
import RangeOf from "Support/RangeOf";
import { UserSettings } from "./UserSettings";
import panic from "Support/panic";


export * as App from "./App";


export type App = {
    mode: Mode,
    editors: Editor[],
    userSettings: UserSettings,
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


export type ActionName = Action["type"];
export const ActionNames = RangeOf<ActionName>()("editor-action", "switch-mode");

export function isAction (action: Action): action is Action {
    return ActionNames.includes(action.type as ActionName);
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
    model: App,
    reducer: (state: App, action: Action) => Promise<App>,
};


export async function reducer (state: App, action: Action): Promise<App> {
    const out = {...state};

    switch (action.type) {
        case "editor-action": {
            const editorIndex = state.editors.findIndex(editor => editor.id === action.value.editorId);
            if (editorIndex < 0) panic("Invalid Editor ID for Editor Action", action.value);
            out.editors[editorIndex] = await Editor.reducer(out.editors[editorIndex], action.value.editorAction);
        } break;

        case "switch-mode": {
            out.mode = action.value;
        } break;

        default: panic("Invalid App Action", action);
    }

    return out;
}