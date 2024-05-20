import "Support/remote";

import { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { styled } from "styled-components";

import { App as Model, reducer } from "Model/App";
import { Editor as EditorModel, createEditor } from "Model/Editor";

import { createDocument } from "Document";

import Divider from "./Divider";

import Editor from "./modes/Editor";



const docs = [
    createDocument("untitled 1", {}, (await import("Model/initialValue/lipsum")).default),
    createDocument("untitled 2", {}, (await import("Model/initialValue/minimal")).default),
];


export type App
    = FunctionComponent
    & Model.Instance
    ;


const Body = styled.div`
    flex-grow: 1;
    max-height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    align-items: stretch;

    font-family: Roboto;
    background-color: #f0f0f0;
    color: #202020;
    border-radius: 1em;
`;



function AppElement (): ReactElement {
    const [app, updateApp] = useState(App.model);

    async function appDispatch (action: Model.Action) {
        App.model = await reducer(App.model, action);
        updateApp(App.model);
    }


    useEffect(() => {
        let size = window.innerWidth;

        const onResize = async () => {
            const newSize = window.innerWidth;
            const oldSize = size;

            size = newSize;

            app.editors.forEach((editor: EditorModel) => appDispatch({
                type: "editor-action",
                value: {
                    editorId: editor.id,
                    editorAction: {type: "resize", value: newSize * (editor.width / oldSize)},
                },
            }));
        };

        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, [app]);


    return <Body>
        <Model.Provider app={app} dispatch={appDispatch}>
            {app.editors.flatMap((editor, index) => {
                const elems = [<Editor key={editor.id} editorId={editor.id} />];

                if (index < app.editors.length - 1) {
                    elems.push(<Divider
                        key={`divider-${index}`}
                        leftEditorId={editor.id}
                        rightEditorId={app.editors[index + 1].id}
                    />);
                }

                return elems;
            })}
        </Model.Provider>
    </Body>;
}


export const App: App = AppElement as any;

App.model = {
    mode: { name: "editor", editorId: 0 },
    editors: docs.map((doc, index) =>
        createEditor(
            index,
            window.innerWidth / docs.length,
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
