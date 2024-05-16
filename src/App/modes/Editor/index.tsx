import { IdProvider, deriveEditorFromId } from "Model/Editor";
import DocEditor from "./DocumentEditor";
import ScrollRegion from "Elements/ScrollRegion";
import { Api, Point, Selection, Slate } from "Model/Slate";
import { useEffect, useRef, useState } from "react";
import { TextDecoration } from "Document/Text";
import { Descendant } from "Document/hierarchy";
import { Range, RangeRef } from "slate";
import { DOMRange } from "slate-react/dist/utils/dom";
import styled from "styled-components";
import { deepCompare } from "Support/deep";


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


    function removeSelectionElems(selectionElems: [DOMRect, HTMLDivElement][], desiredLength: number = 0) {
        while (selectionElems.length > desiredLength) {
            const [_, elem] = selectionElems.pop() as [DOMRect, HTMLDivElement];
            elem.remove();
        }
    }

    function updateSelection (domRange: DOMRange, root: Element, selectionElems: [DOMRect, HTMLDivElement][]) {
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

        function calculateBoundingRect (textNode: Node): DOMRect[] {
            const range = document.createRange();
            range.selectNode(textNode);

            if (domRange.startContainer === textNode) {
                range.setStart(textNode, domRange.startOffset);
            }

            if (domRange.endContainer === textNode) {
                range.setEnd(textNode, domRange.endOffset);
            }

            return Array.from(range.getClientRects());
        }

        const nodes = getNodesInRange(domRange).filter(node => node instanceof Text);
        const nodeRects = nodes.flatMap(calculateBoundingRect);

        if (nodeRects.length > 0 && nodeRects[nodeRects.length - 1].width < 2) {
            nodeRects.pop();
        }

        const minWidth = 4;

        const rootRect = root.getBoundingClientRect();

        nodeRects.forEach((rect, index) => {
            if (rect.width < minWidth) rect.width = minWidth;

            rect.y -= rootRect.y;

            let elem;
            if (index < selectionElems.length) {
                elem = selectionElems[index][1];
                selectionElems[index][0] = rect;
            } else {
                elem = root.appendChild(document.createElement("div"));
                selectionElems.push([rect, elem]);
            }

            elem.className = "textSelection";

            elem.style.top = `${rect.top + 1.5}px`;
            elem.style.left = `${rect.left}px`;
            elem.style.width = `${rect.width}px`;
            elem.style.height = `${rect.height - 3}px`;
        });

        removeSelectionElems(selectionElems, nodeRects.length);
    }

    function updateSelectionPosition (x: number, selectionElems: [DOMRect, HTMLDivElement][]) {
        selectionElems.forEach(([rect, elem]) => {
            rect.x += x;
            elem.style.left = `${rect.left}px`;
        });
    }

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

    const selectionElems = useRef<[DOMRect, HTMLDivElement][]>([]);
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let stop = false;
        let lastRange: DOMRange | null = null;
        let lastX = 0;
        requestAnimationFrame(function foo() {
            if (root.current) {
                if (!focused) {
                    const domRange = (selected && Api.toDOMRange(editor.slate, selected)) ?? null;
                    if (!deepCompare(domRange, lastRange)) {
                        lastRange = domRange;
                        lastX = root.current.getBoundingClientRect().x;
                        if (domRange) updateSelection(domRange, root.current, selectionElems.current);
                        else removeSelectionElems(selectionElems.current);
                    } else {
                        const newX = root.current.getBoundingClientRect().x;
                        if (newX !== lastX) {
                            const diff = newX - lastX;
                            lastX = newX;
                            updateSelectionPosition(diff, selectionElems.current);
                        }
                    }
                } else {
                    removeSelectionElems(selectionElems.current);
                }
            }

            if (!stop) requestAnimationFrame(foo);
        });
        return () => {
            stop = true;
            removeSelectionElems(selectionElems.current);
        };
    }, [selected, focused]);

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
            <TextStyles ref={root}>
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

