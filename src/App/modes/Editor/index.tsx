import { useState } from "react";
import styled from "styled-components";

import { IdProvider, deriveEditorFromId } from "Model/Editor";
import { Api, RangeRef, Selection, Range } from "Model/Slate";
import { makeRangeRef, updateRangeRef } from "Model/util";

import { TextMarks } from "Document/Text";
import { Descendant } from "Document/hierarchy";

import DocEditor from "./DocumentEditor";
import ToolBar from "./ToolBar";
import StatusBar from "./StatusBar";


export type EditorProps = {
    editorId: number,
};


const Body = styled.div.attrs<{$width?: number}>(({$width}) => ({
    style: $width? { width: `${$width}px` } : {}
}))`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
`;


export default function Editor ({editorId}: EditorProps) {
    const [editor] = deriveEditorFromId(editorId);

    const [textMarks, setTextMarks] = useState<Partial<TextMarks>>({});
    const [lastSelection, setLastSelection] = useState<RangeRef | null>(null);
    const [selection, setSelection] = useState(makeRangeRef(editor.slate, editor.slate.selection));
    const [focused, setFocused] = useState(Api.isFocused(editor.slate));

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


    const selected = selection?.current ?? lastSelection?.current ?? null;
    const disableToolbar = focused? false : selected? Range.isCollapsed(selected) : true;


    return <IdProvider value={editorId}>
        <Body id={`editor-${editorId}`} $width={editor.width}>
            <ToolBar id={`tool-bar-${editorId}`} textMarks={textMarks} disabled={disableToolbar} />
            <DocEditor
                onBlur={blurHandler}
                onFocus={focusHandler}
                onChange={valueHandler}
                onSelectionChange={selectionHandler}
            />
            <StatusBar id={`status-bar-${editorId}`} focused={focused} selected={selected} />
        </Body>
    </IdProvider>;
}

