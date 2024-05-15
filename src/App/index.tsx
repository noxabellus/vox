import "Support/remote";

import { styled } from "styled-components";

import { Descendant } from "slate";

import { App as Model } from "Model/App";
import Editor from "./modes/Editor";
import { createEditor } from "Model/Editor";
import { createDocument } from "Document";
import { FunctionComponent, ReactElement, useState } from "react";



const Body = styled.div`
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    font-family: Roboto;
    background-color: #f0f0f0;
    color: #202020;
    border-radius: 1em;

    & h1 {
        font-size: 2em;
        line-height: 1.25em;
    }

    & blockquote {
        border: 1px solid #202020;
        border-radius: .25em;
        padding: 1em 1em;
    }
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
    { type: "paragraph", children: [{text: ""}] },
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
