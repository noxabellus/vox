import { useState } from "react";

import { IdProvider, deriveEditorFromId } from "Model/Editor";
import { Api, RangeRef, Selection } from "Model/Slate";
import { makeRangeRef, updateRangeRef } from "Model/util";

import { TextMarks } from "Document/Text";
import { Descendant } from "Document/hierarchy";

import DocEditor from "./DocumentEditor";
import styled from "styled-components";
import ToolBar from "./Toolbar";


export type EditorProps = {
    editorId: number,
};


const Body = styled.div.attrs<{$width: number}>(props => ({
    style: {
        width: `${props.$width}px`
    }
}))`
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    background-color: rgb(var(--background-color));
    border-radius: var(--minor-border-radius);
`;


export default function Editor ({editorId}: EditorProps) {
    const [editor, _editorDispatch] = deriveEditorFromId(editorId);

    const [textMarks, setTextMarks] = useState<Partial<TextMarks>>({});
    const [_lastSelection, setLastSelection] = useState<RangeRef | null>(null);
    const [selection, setSelection] = useState(makeRangeRef(editor.slate, editor.slate.selection));
    const [focused, setFocused] = useState(Api.isFocused(editor.slate));

    // const selected = selection?.current || lastSelection?.current;

    const valueHandler = (_document: Descendant[]) => {
        setTextMarks(Api.marks(editor.slate) || {});
    };

    const selectionHandler = (newSelection: Selection) => {
        if (!focused) return;

        setLastSelection(updateRangeRef(selection));
        setSelection(makeRangeRef(editor.slate, newSelection));
    };

    const blurHandler = () => {
        setFocused(false);

        setLastSelection(updateRangeRef(selection));
        setSelection(null);
    };

    const focusHandler = (newSelection: Selection) => {
        setFocused(true);

        setLastSelection(updateRangeRef(selection));
        setSelection(makeRangeRef(editor.slate, newSelection));
    };


    return <IdProvider value={editorId}>
        <Body id={`editor-${editorId}`} $width={editor.width}>
            <ToolBar id={`toolbar-${editorId}`} textMarks={textMarks} />
            <DocEditor
                onBlur={blurHandler}
                onFocus={focusHandler}
                onChange={valueHandler}
                onSelectionChange={selectionHandler}
            />
        </Body>
    </IdProvider>;
}

