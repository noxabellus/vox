import "Support/remote";

import { styled } from "styled-components";

import { Descendant } from "Document/hierarchy";

import { App as Model } from "Model/App";
import Editor from "./modes/Editor";
import { createEditor } from "Model/Editor";
import { createDocument } from "Document";
import { FunctionComponent, ReactElement, useState } from "react";


const Body = styled.div`
    flex-grow: 1;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;

    font-family: Roboto;
    background-color: #f0f0f0;
    color: #202020;
    border-radius: 1em;
`;

import initialValue from "Model/minimal.js";

export type AppType
    = FunctionComponent
    & Model.Instance
    ;





function AppElement (): ReactElement {
    const [app, updateApp] = useState(App.model);

    async function appDispatch (action: Model.Action) {
        App.model = await App.reducer(App.model, action);
        updateApp(App.model);
    }

    return <Body>
        <Model.Provider app={app} dispatch={appDispatch}>
            <Editor editorId={0}/>
        </Model.Provider>
    </Body>;
}

export const App: AppType = AppElement as any;

App.model = {
    mode: { name: "editor", editorId: 0 },
    editors: [
        createEditor(
            0,
            undefined,
            createDocument("untitled", {}, initialValue as Descendant[])
        )
    ],
    userSettings: {
        autoSaveByDefault: false,
        keyBindings: {},
    },
};

App.reducer = Model.reducer;

App.displayName = "App";

export default App;
