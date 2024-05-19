import { useState } from "react";

import { IdProvider, deriveEditorFromId } from "Model/Editor";
import { Api, showSelection, RangeRef, Selection } from "Model/Slate";
import { makeRangeRef, updateRangeRef } from "Model/util";

import { TextMarks } from "Document/Text";
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

    const [textMarks, setTextMarks] = useState<Partial<TextMarks>>({});
    const [lastSelection, setLastSelection] = useState<RangeRef | null>(null);
    const [selection, setSelection] = useState<RangeRef | null>(makeRangeRef(editor.slate, editor.slate.selection));
    const [focused, setFocused] = useState<boolean>(Api.isFocused(editor.slate));

    const selected = selection?.current || lastSelection?.current;

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
            <nav style={{display: "flex", flexDirection: "column", flexWrap: "wrap"}}>
                <h1 style={{userSelect: "none", width: "100%"}}
                    onMouseDown={e => e.preventDefault()} // prevent editor from losing focus
                    onClick={() => editorDispatch({type: "set-title", value: "a new title"})}
                >{editor.title}</h1>
                <div style={{alignSelf: "center"}}>
                    <button
                        style={{cursor: "pointer", fontWeight: "bold", color: textMarks.bold ? "blue" : "gray"}}
                        onMouseDown={e => e.preventDefault()}
                        onClick={async () =>
                            editorDispatch({
                                type: "slate-action",
                                value: slate => {
                                    if (!selected) return;

                                    if (textMarks?.bold) {
                                        Api.removeMark(slate, "bold");
                                    } else {
                                        Api.addMark(slate, "bold", true);
                                    }
                                },
                            })
                        }
                    >B</button>

                    <button
                        style={{cursor: "pointer", fontStyle: "italic", color: textMarks.italic ? "blue" : "gray"}}
                        onMouseDown={e => e.preventDefault()}
                        onClick={async () =>
                            editorDispatch({
                                type: "slate-action",
                                value: slate => {
                                    if (!selected) return;

                                    if (textMarks?.italic) {
                                        Api.removeMark(slate, "italic");
                                    } else {
                                        Api.addMark(slate, "italic", true);
                                    }
                                },
                            })
                        }
                    >I</button>

                    <button
                        style={{cursor: "pointer", textDecoration: "underline", color: textMarks.underline ? "blue" : "gray"}}
                        onMouseDown={e => e.preventDefault()}
                        onClick={async () =>
                            editorDispatch({
                                type: "slate-action",
                                value: slate => {
                                    if (!selected) return;

                                    if (textMarks?.underline) {
                                        Api.removeMark(slate, "underline");
                                    } else {
                                        Api.addMark(slate, "underline", true);
                                    }
                                },
                            })
                        }
                    >U</button>
                </div>
                <span style={{alignSelf: "flex-end", fontFamily: "monospace"}}>Curr Selection:</span>
                <span style={{alignSelf: "flex-end", fontFamily: "monospace"}}>{showSelection(selection?.current)}</span>
                <span style={{alignSelf: "flex-end", fontFamily: "monospace"}}>Last Selection:</span>
                <span style={{alignSelf: "flex-end", fontFamily: "monospace"}}>{showSelection(lastSelection?.current)}</span>
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

