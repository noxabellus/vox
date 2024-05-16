import { IdProvider, deriveEditorFromId } from "Model/Editor";
import DocEditor from "./DocumentEditor";
import ScrollRegion from "Elements/ScrollRegion";
import { Api, Point, Selection, Slate } from "Model/Slate";
import { useEffect, useState } from "react";
import { TextDecoration } from "Document/Text";
import { Descendant } from "Document/hierarchy";
import { Range, RangeRef } from "slate";
import { DOMRange } from "slate-react/dist/utils/dom";
import styled from "styled-components";


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

const TextStyles = styled.div`
    & .textSelection {
        position: absolute;
        pointer-events: none;
        /* background: rgba(52, 77, 81, 0.612); */
        backdrop-filter: invert(100%);
        /* outline: 1px dashed red; */
    }
`;

export default function Editor ({editorId}: EditorProps) {
    const [editor, editorDispatch] = deriveEditorFromId(editorId);

    const [textDecoration, setTextDecoration] = useState<Partial<TextDecoration>>({});
    const [lastSelection, setLastSelection] = useState<RangeRef | null>(null);
    const [selection, setSelection] = useState<RangeRef | null>(makeRangeRef(editor.slate, editor.slate.selection));
    const [focused, setFocused] = useState<boolean>(Api.isFocused(editor.slate));
    const [selectionData, setSelectionData] = useState<[HTMLElement, DOMRect[]] | null>(null);
    const [selectionElems, setSelectionElems] = useState<HTMLDivElement[] | null>(null);

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

    useEffect(() => {
        if (!focused) {
            const domRange = selected && Api.toDOMRange(editor.slate, selected);
            if (!domRange) return;

            function getNextNode (node: Node, skipChildren: boolean, endNode: Node): Node | null {
                if (endNode == node) return null;

                if (node.firstChild && !skipChildren) return node.firstChild;

                if (!node.parentNode) return null;

                return node.nextSibling
                    || getNextNode(node.parentNode, true, endNode);
            }

            function getNodesInRange (range: DOMRange): Node[] {
                let startNode: Node | null
                     = range.startContainer.childNodes[range.startOffset]
                    || range.startContainer;

                const endNode
                     = range.endContainer.childNodes[range.endOffset]
                    || range.endContainer;

                if (startNode == endNode && startNode.childNodes.length === 0) {
                    return [startNode];
                };

                const nodes = [];

                /* eslint-disable no-cond-assign */
                do nodes.push(startNode);
                while (startNode = getNextNode(startNode, false , endNode));
                /* eslint-enable no-cond-assign */

                return nodes;
            }

            const calculateBoundingRect = (textNode: Node): DOMRect[] => {
                const range = document.createRange();
                range.selectNode(textNode);

                if (domRange.startContainer === textNode) {
                    range.setStart(textNode, domRange.startOffset);
                }

                if (domRange.endContainer === textNode) {
                    range.setEnd(textNode, domRange.endOffset);
                }

                return Array.from(range.getClientRects());
            };

            let root: any = domRange.commonAncestorContainer;
            while (!(root instanceof HTMLElement) || root?.dataset?.slateEditor !== "true") {
                root = root.parentNode;
                if (!root) throw "idk how this happened, but the selection is out of bounds";
            }

            // root = root.parentNode;


            const nodes = getNodesInRange(domRange).filter(node => node instanceof Text);
            const nodeRects = nodes.flatMap(calculateBoundingRect);

            if (nodeRects.length && nodeRects[nodeRects.length - 1].width < 2) {
                nodeRects.pop();
            }

            if (nodeRects.length == 0) {
                setSelectionData(null);
                return;
            }

            const minWidth = 4;

            const rootRect = root.getBoundingClientRect();
            const finalRects = nodeRects.map(rect => {
                if (rect.width < minWidth) rect.width = minWidth;

                rect.x -= rootRect.x;
                rect.y -= rootRect.y;

                return rect;
            });

            setSelectionData([root, finalRects]);
        } else {
            setSelectionData(null);
        }
    }, [focused]);

    useEffect(() => {
        const updateSelectionElems = (newElems: HTMLDivElement[] | null) => (oldElems: HTMLDivElement[] | null) => {
            if (oldElems) oldElems.forEach(e => e.remove());
            return newElems;
        };

        if (selectionData) {
            const elems: HTMLDivElement[] = [];

            const [root, selectionRects] = selectionData;

            selectionRects.forEach((rect) => {
                const elem = document.createElement("div");

                elem.className = "textSelection";

                elem.style.top = `${rect.top + 1.5}px`;
                elem.style.left = `${rect.left}px`;
                elem.style.width = `${rect.width}px`;
                elem.style.height = `${rect.height - 3}px`;

                root.appendChild(elem);

                elems.push(elem);
            });


            setSelectionElems(updateSelectionElems(elems));
        } else if (selectionElems) {
            setSelectionElems(updateSelectionElems(null));
        }

        return () => {
            setSelectionElems(updateSelectionElems(null));
        };
    }, [selectionData]);

    return <IdProvider value={editorId}>
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
            <span style={{alignSelf: "flex-end"}}>{`Selected: ${showSelection(selection?.current)}`}</span>
            <span style={{alignSelf: "flex-end"}}>{`Last: ${showSelection(lastSelection?.current)}`}</span>
        </nav>
        <ScrollRegion>
            <TextStyles>
                <DocEditor
                    onBlur={blurHandler}
                    onFocus={focusHandler}
                    onChange={valueHandler}
                    onSelectionChange={selectionHandler}
                />
            </TextStyles>
        </ScrollRegion>
    </IdProvider>;
}

