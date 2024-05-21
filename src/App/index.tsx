import { FunctionComponent, ReactElement, useState } from "react";

import * as remote from "Support/remote";
import { unreachable } from "Support/panic";

import { createDocument } from "Document";

import { App as Model, reducer } from "Model/App";
import { createEditor } from "Model/Editor";

import Editor from "./modes/Editor";
import Splash from "./modes/Splash";
import MultiEditor from "./modes/MultiEditor";


const docs = [
    createDocument("untitled 1", {}, (await import("Model/initialValue/lipsum")).default),
    createDocument("untitled 2", {}, (await import("Model/initialValue/minimal")).default),
];


export type App
    = FunctionComponent
    & Model.Instance
    ;


function AppElement (): ReactElement {
    const [app, updateApp] = useState(App.model);

    async function appDispatch (action: Model.Action) {
        App.model = await reducer(App.model, action);
        updateApp(App.model);
    }


    let mode;

    switch (app.mode.name) {
        case "splash": {
            remote.window.setMinimumSize(440, 400);
            remote.window.setSize(440, 400, false);
            remote.window.setResizable(false);
            mode = <Splash />;
        } break;

        case "editor": {
            remote.window.setMinimumSize(800, 600);
            remote.window.setSize(800, 600, true);
            remote.window.setResizable(true);
            mode = <Editor editorId={app.mode.editorId} />;
        } break;

        case "multi-editor": {
            remote.window.setMinimumSize(800, 600);
            remote.window.setSize(800, 600, true);
            remote.window.setResizable(true);
            mode = <MultiEditor editorIds={app.mode.editorIds} />;
        } break;

        case "user-settings": {
            remote.window.setMinimumSize(800, 600);
            remote.window.setSize(800, 600, true);
            remote.window.setResizable(true);
            unreachable("User Settings Mode not implemented");
        } break;

        default: unreachable("Invalid App Mode", app.mode);
    }


    return <Model.Provider app={app} dispatch={appDispatch}>
        {mode}
    </Model.Provider>;
}


export const App: App = AppElement as any;

App.model = {
    mode: { name: "splash" },
    editors: docs.map((doc, index) =>
        createEditor(
            index,
            undefined,
            doc,
        )
    ),
    userSettings: {
        autoSaveByDefault: false,
        keyBindings: {},
    },
    lockIO: false,
};

App.displayName = "App";

export default App;
