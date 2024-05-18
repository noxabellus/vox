import { useState } from "react";

import { IdProvider, deriveEditorFromId } from "Model/Editor";
import { Api, showSelection, RangeRef, Selection } from "Model/Slate";
import { makeRangeRef, updateRangeRef } from "Model/util";

import { TextShape } from "Document/Text";
import { Descendant } from "Document/hierarchy";

import DocEditor from "./DocumentEditor";
import styled from "styled-components";


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
`;


export default function Editor ({editorId}: EditorProps) {
    const [editor, editorDispatch] = deriveEditorFromId(editorId);

    const [textDecoration, setTextDecoration] = useState<Partial<TextShape>>({});
    const [lastSelection, setLastSelection] = useState<RangeRef | null>(null);
    const [selection, setSelection] = useState<RangeRef | null>(makeRangeRef(editor.slate, editor.slate.selection));
    const [focused, setFocused] = useState<boolean>(Api.isFocused(editor.slate));

    const selected = selection?.current || lastSelection?.current;

    const valueHandler = (_document: Descendant[]) => {
        const marks = Api.marks(editor.slate);
        setTextDecoration(marks || {});
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
            <nav style={{display: "flex", flexDirection: "column", flexWrap: "wrap"}}>
                <h1 style={{userSelect: "none", width: "100%"}}
                    onMouseDown={e => e.preventDefault()} // prevent editor from losing focus
                    onClick={() => editorDispatch({type: "set-title", value: "a new title"})}
                >{editor.title}</h1>
                <div style={{alignSelf: "center"}}>
                    <button
                        style={{cursor: "pointer", fontWeight: "bold", color: textDecoration.bold ? "blue" : "gray"}}
                        onMouseDown={e => e.preventDefault()}
                        onClick={async () =>
                            editorDispatch({
                                type: "slate-action",
                                value: slate => {
                                    if (!selected) return;

                                    slate.setSelection(selected);

                                    const marks = Api.marks(slate);
                                    if (marks?.bold) {
                                        Api.removeMark(slate, "bold");
                                    } else {
                                        Api.addMark(slate, "bold", true);
                                    }
                                },
                            })
                        }
                    >B</button>
                </div>
                <span style={{alignSelf: "flex-end", fontFamily: "monospace"}}>Curr Selection:</span>
                <span style={{alignSelf: "flex-end"}}>{showSelection(selection?.current)}</span>
                <span style={{alignSelf: "flex-end", fontFamily: "monospace"}}>Last Selection:</span>
                <span style={{alignSelf: "flex-end"}}>{showSelection(lastSelection?.current)}</span>
            </nav>
            <DocEditor
                onBlur={blurHandler}
                onFocus={focusHandler}
                onChange={valueHandler}
                onSelectionChange={selectionHandler}
            />
        </Body>
    </IdProvider>;
}

