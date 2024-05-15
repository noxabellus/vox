import { CSSProperties, KeyboardEvent, useCallback } from "react";
import { Editable } from "slate-react";

import { Slate }  from "Model/Slate";
import { App, useApp } from "Model/App";
import { deriveEditorFromApp } from "Model/Editor";

import leafRenderer from "./renderers/leaf";
import elementRenderer from "./renderers/element";


export type DocumentEditorProps = {
    placeholder?: string,
    style?: CSSProperties,
    onKeyDown?: (e: KeyboardEvent, app: App, dispatch: App.Dispatch) => void,
    onKeyUp?: (e: KeyboardEvent, app: App, dispatch: App.Dispatch) => void,
};


export default function DocumentEditor ({style, placeholder, onKeyDown, onKeyUp}: DocumentEditorProps) {
    const [app, appDispatch] = useApp();
    const [editor] = deriveEditorFromApp(app, appDispatch);

    const renderLeaf = useCallback(leafRenderer, []);
    const renderElement = useCallback(elementRenderer, []);

    console.log("DocumentEditor");

    return <Slate.Context key={`slateContext${editor.id}`} slate={editor.slate}>
        <Editable
            key={`editable${editor.id}`}

            onKeyDown={e => onKeyDown?.(e, app, appDispatch)}
            onKeyUp={e => onKeyUp?.(e, app, appDispatch)}

            renderLeaf={renderLeaf}
            renderElement={renderElement}

            style={style}
            placeholder={placeholder}

            readOnly={false} // TODO: lockIO

            disableDefaultStyles={false}
        />
    </Slate.Context>;
}
