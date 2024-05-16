import { CSSProperties, KeyboardEvent } from "react";
import { Editable } from "slate-react";

import { Selection, Slate }  from "Model/Slate";
import { App, useApp } from "Model/App";
import { deriveEditorFromApp } from "Model/Editor";

import leafRenderer from "./renderers/leaf";
import elementRenderer from "./renderers/element";
import styled from "styled-components";


export type DocumentEditorProps = {
    placeholder?: string,
    style?: CSSProperties,
    onBlur?: () => Promise<void> | void,
    onFocus?: (selection: Selection) => Promise<void> | void,
    onKeyDown?: (e: KeyboardEvent, app: App, dispatch: App.Dispatch) => Promise<void> | void,
    onKeyUp?: (e: KeyboardEvent, app: App, dispatch: App.Dispatch) => Promise<void> | void,
} & Slate.ContextCallbacks;

const StyledEditable = styled(Editable)`
    padding: 1em;
    background: wheat;
    height: fit-content;
    width: 8.5in;
    margin: 1em;

    /* caret-color: transparent !important;

    & *::selection {
        background: none;
        color: inherit;
    } */

    & h1 {
        font-size: 2em;
        line-height: 1.25em;
    }

    & blockquote {
        border: 1px solid #202020;
        border-radius: .25em;
        padding: 1em;
        margin: 1em;
    }
`;


export default function DocumentEditor ({style, placeholder, onBlur, onFocus, onChange, onSelectionChange, onValueChange, onKeyDown, onKeyUp}: DocumentEditorProps) {
    const [app, appDispatch] = useApp();
    const [editor] = deriveEditorFromApp(app, appDispatch);

    return <Slate.Context
        slate={editor.slate}

        onChange={value => onChange?.(value)}
        onSelectionChange={selection => onSelectionChange?.(selection)}
        onValueChange={value => onValueChange?.(value)}
    >
        <StyledEditable
            onBlur={(_ => onBlur?.())}
            onFocus={(_ => onFocus?.(editor.slate.selection))}
            onKeyDown={e => onKeyDown?.(e, app, appDispatch)}
            onKeyUp={e => onKeyUp?.(e, app, appDispatch)}

            renderLeaf={leafRenderer}
            renderElement={elementRenderer}

            style={style}
            placeholder={placeholder}

            readOnly={false} // TODO: lockIO

            disableDefaultStyles={false}
        />
    </Slate.Context>;
}
