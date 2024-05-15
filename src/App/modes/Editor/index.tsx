import { IdProvider, deriveEditorFromId } from "Model/Editor";
import DocEditor from "./DocumentEditor";
import ScrollRegion from "Elements/ScrollRegion";
import { Api, Point, Selection, Slate } from "Model/Slate";
import { useState } from "react";
import { TextDecoration } from "Document/Text";
import { Descendant } from "Document/hierarchy";
import { Range, RangeRef } from "slate";


export type EditorProps = {
    editorId: number,
};

function showPoint (point: Point) {
    return `${point.path.join(".")}:${point.offset}`;
}

function showSelection (selection?: Range | null) {
    if (!selection) return "none";
    const anchor = showPoint(selection.anchor);
    const focus = showPoint(selection.focus);

    if (anchor == focus) return anchor;
    else return `${anchor} -> ${focus}`;
}

function makeRangeRef (editor: Slate, selection: Selection): RangeRef | null {
    return selection? Api.rangeRef(editor, selection) : null;
}

function updateRangeRef (newValue: RangeRef | null) {
    return (oldValue: RangeRef | null) => {
        oldValue?.unref();
        return newValue;
    };
}

export default function Editor ({editorId}: EditorProps) {
    const [editor, editorDispatch] = deriveEditorFromId(editorId);

    const [textDecoration, setTextDecoration] = useState<Partial<TextDecoration>>({});
    const [lastSelection, setLastSelection] = useState<RangeRef | null>(null);
    const [selection, setSelection] = useState<RangeRef | null>(makeRangeRef(editor.slate, editor.slate.selection));

    const valueHandler = async (_value: Descendant[]) => {
        const marks = Api.marks(editor.slate);
        console.log("valueHandler", marks);
        setTextDecoration(marks || {});
    };

    const selectionHandler = async (newSelection: Selection) => {
        const marks = newSelection? Api.marks(editor.slate) : null;
        console.log("selectionHandler", marks);
        setTextDecoration(marks || {});
        setLastSelection(updateRangeRef(selection));
        setSelection(makeRangeRef(editor.slate, newSelection));
    };

    const selected = selection?.current || lastSelection?.current;

    return <IdProvider key={`idProvider${editorId}`} value={editorId}>
        <nav style={{display: "flex", flexDirection: "column", flexWrap: "wrap"}}>
            <h1 style={{userSelect: "none", width: "100%"}}
                onMouseDown={e => e.preventDefault()} // prevent editor from losing focus
                onClick={() => editorDispatch({type: "set-title", value: "a new title"})}
            >{editor.title}</h1>
            <div style={{alignSelf: "center"}}>
                <button
                    style={{cursor: "pointer", fontWeight: "bold", color: textDecoration.bold ? "blue" : "gray"}}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() =>
                        editorDispatch({
                            type: "slate-action",
                            value: slate => {
                                if (!selected) return;
                                slate.setSelection(selected);
                                const marks = Api.marks(slate);
                                if (!marks?.bold) {
                                    Api.addMark(slate, "bold", true);
                                } else {
                                    Api.removeMark(slate, "bold");
                                }
                            },
                        })
                    }
                >B</button>
            </div>
            <span style={{alignSelf: "flex-end"}}>{`Selected: ${showSelection(selection?.current)}`}</span>
            <span style={{alignSelf: "flex-end"}}>{`Last: ${showSelection(lastSelection?.current)}`}</span>
        </nav>
        <ScrollRegion id="foo" key={`editorBody${editorId}`}>
            <DocEditor
                key={`docEditor${editorId}`}

                onValueChange={valueHandler}
                onSelectionChange={selectionHandler}
            />
        </ScrollRegion>
    </IdProvider>;
}

