import "Support/remote";

import { styled } from "styled-components";

import { Descendant } from "slate";

import { App as Model } from "Model/App";
import Editor from "./modes/Editor";
import { createEditor } from "Model/Editor";
import { createDocument } from "Document";
import { FunctionComponent, ReactElement, useState } from "react";
import { deepCopy } from "Support/deep";
import { arrayFromFunction } from "Support/array";



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


const initialValue: Descendant[] = [
    {
        type: "heading",
        level: 1,
        children: [
            { text: "A heading!", decoration: { italic: true, underline: true } },
        ],
    },
    {
        type: "paragraph",
        children: [
            { text: "A line of text in a " },
            { text: "paragraph", decoration: { bold: true } },
            { text: "." },
        ],
    },
    ...arrayFromFunction(40, () => deepCopy({ type: "paragraph", children: [{text: ""}] })),
    {
        type: "block-quote",
        children: [
            {
                type: "heading",
                level: 1,
                children: [
                    { text: "A heading!", decoration: { italic: true, underline: true } },
                ],
            },
            {
                type: "paragraph",
                children: [
                    { text: "A line of text in a " },
                    { text: "paragraph", decoration: { bold: true } },
                    { text: "." },
                ],
            },
        ],
    }
];

export type AppType
    = FunctionComponent
    & Model.Instance
    ;





function AppElement (): ReactElement {
    const [app, updateApp] = useState(App.model);

    async function appDispatch (action: Model.Action) {
        console.log("App Dispatch Start");
        App.model = await App.reducer(App.model, action);
        updateApp(_ => {
            console.log("updateApp");
            return App.model;
        });
        console.log("App Dispatch End");
    }

    console.log("App");

    return <Body>
        <Model.Provider app={app} dispatch={appDispatch}>
            <Editor key={`editor${0}`} editorId={0}/>
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
            createDocument("untitled", {}, initialValue)
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
