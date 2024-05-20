import styled from "styled-components";

import { HexRgba } from "Support/color";
import { Vec2, rangeCompare, rectsOverlap, vec2Compare } from "Support/math";

import { Api, Selection, Slate } from "Model/Slate";


function createRects (scrollRect: DOMRect, root: Element, domRange: Range): DOMRect[] {
    const rootRect = root.getBoundingClientRect();
    const rects: DOMRect[] = [];

    function calculateBoundingRects (node: Node) {
        if (node.nodeType !== Node.TEXT_NODE) return;

        const minWidth = 4;

        const range = document.createRange();
        range.selectNode(node);

        if (domRange.startContainer === node) {
            range.setStart(node, domRange.startOffset);
        }

        if (domRange.endContainer === node) {
            range.setEnd(node, domRange.endOffset);
        }

        for (const rect of range.getClientRects()) {
            if (!rectsOverlap(rect, scrollRect)) continue;

            if (rect.width < minWidth) rect.width = minWidth;

            rect.x -= rootRect.x;
            rect.y -= rootRect.y;

            rects.push(rect);
        }
    }

    function getNextNode (node: Node, skipChildren: boolean, endNode: Node): Node | null {
        if (endNode == node) return null;

        if (node.firstChild && !skipChildren) return node.firstChild;

        if (!node.parentNode) return null;

        return node.nextSibling
            || getNextNode(node.parentNode, true, endNode);
    }

    let startNode: Node | null
        = domRange.startContainer.childNodes[domRange.startOffset]
        || domRange.startContainer;

    const endNode
        = domRange.endContainer.childNodes[domRange.endOffset]
        || domRange.endContainer;

    if (startNode == endNode && startNode.childNodes.length === 0) {
        calculateBoundingRects(startNode);
    } else {
        while (startNode) {
            calculateBoundingRects(startNode);
            startNode = getNextNode(startNode, false, endNode);
        }
    }

    if (rects.length > 1 && rects[rects.length - 1].width < 2) {
        rects.pop();
    }

    return rects;
}

function updateSelection (nodeRects: DOMRect[]) {
    const root = document.createElement("div");
    root.id = "selectionContainer";

    for (let index = 0; index < nodeRects.length; index ++) {
        const rect = nodeRects[index];
        const elem = document.createElement("div");

        elem.className = "textSelection";
        elem.style.left = `${rect.left}px`;
        elem.style.top = `${rect.top + 1.5}px`;
        elem.style.width = `${rect.width}px`;
        elem.style.height = `${rect.height - 3}px`;

        root.appendChild(elem);
    }

    return root;
}

export const TextStyles = styled.div.attrs<{$focus: boolean, $textColor: HexRgba}>(({$focus, $textColor}) => ({
    style: {
        "--selection-opacity": $focus ? "0.4" : "0.2",
        "--caret-color": $textColor,
        "--animation-name": $focus ? "cursor-pulse" : "none",
    } as any
}))`
    background: wheat;
    margin: 1em;

    & #selectionContainer {
        position: relative;
        height: 0;
        overflow: show;
    }

    & .textSelection {
        box-sizing: content-box;
        position: absolute;
        pointer-events: none;
        background-color: rgba(255, 0, 255, var(--selection-opacity));
    }

    & .collapsed .textSelection {
        width: 2px !important;
        margin-left: -2px;
        animation: var(--animation-name) 1s infinite;
        background-color: rgb(255, 0, 255);
        margin-top: -4px;
        border-top: 5px solid var(--caret-color);
        border-left: 2px solid var(--caret-color);
        opacity: calc(0.7 - var(--selection-opacity));
    }

    caret-color: transparent;

    & *::selection {
        background: inherit;
        color: inherit;
    }

    @keyframes cursor-pulse {
        0% { opacity: 1; }
        50% { opacity: 0; }
        100% { opacity: 1; }
    }
`;

export type SelectionState = {
    slate: Slate,
    selected: Selection,
    root?: HTMLDivElement,
    container?: HTMLDivElement,
    lastRange?: Range,
    lastScroll?: Vec2,
};

export function selectionStep (state: SelectionState) {
    if (!state.root) return;

    const domRange = (state.selected && Api.toDOMRange(state.slate, state.selected)) ?? undefined;

    const scrollNode = state.root.parentElement?.parentElement as Element;
    const screenRect = scrollNode.getBoundingClientRect() as DOMRect;

    screenRect.x -= 100;
    screenRect.y -= 100;
    screenRect.width += 200;
    screenRect.height += 200;

    const scroll = [scrollNode.scrollLeft, scrollNode.scrollTop] as Vec2;
    if (rangeCompare(domRange, state.lastRange) && vec2Compare(scroll, state.lastScroll)) return;

    state.lastRange = domRange;
    state.lastScroll = scroll;

    if (domRange) {
        const nodeRects = createRects(screenRect, state.root, domRange);
        const container = updateSelection(nodeRects);

        if (domRange.collapsed) container.className = "collapsed";

        if (state.container) {
            state.container.replaceWith(container);
        } else {
            state.root.prepend(container);
        }

        state.container = container;
    } else if (state.container) {
        state.container.remove();
        delete state.container;
    }
}

export function selectionStop (state: SelectionState) {
    if (state.container) {
        state.container.remove();
    }
}
