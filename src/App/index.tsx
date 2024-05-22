import { FunctionComponent, ReactElement } from "react";

import "Support/remote";
import { unreachable } from "Support/panic";

import { createDocument } from "Document";

import { App as Model } from "Model/App";
import { createEditor } from "Model/Editor";

import Editor from "./modes/Editor";
import Splash from "./modes/Splash";
import MultiEditor from "./modes/MultiEditor";
import UserSettings from "./modes/UserSettings";
import { WindowInfo } from "Model/WindowInfo";


const docs = [
    createDocument("untitled 1", {}, (await import("Model/initialValue/lipsum")).default),
    createDocument("untitled 2", {}, (await import("Model/initialValue/minimal")).default),
];


export type App
    = FunctionComponent
    & Model.Instance
    ;



function AppElement (): ReactElement {
    const [app, appDispatch] = Model.useState(App);

    const windowInfo = WindowInfo.useStore({
        size: [440, 400],
        minimumSize: [440, 400],
        position: [1, 1],
        mode: {name: "widget"},
        lastState: "normal"
    });


    let mode;
    switch (app.mode.name) {
        case "splash": {
            mode = <Splash />;
        } break;

        case "editor": {
            mode = <Editor editorId={app.mode.editorId} />;
        } break;

        case "multi-editor": {
            mode = <MultiEditor editorIds={app.mode.editorIds} />;
        } break;

        case "user-settings": {
            mode = <UserSettings />;
        } break;

        default: unreachable("Invalid App Mode", app.mode);
    }


    return <WindowInfo.Provider value={windowInfo}>
        <Model.Provider app={app} dispatch={appDispatch}>
            {mode}
        </Model.Provider>
    </WindowInfo.Provider>;
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
