import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { clamp } from "Support/math";

import { MIN_WIDTH, deriveEditorFromId } from "Model/Editor";


export type EditorDividerProps = {
    leftEditorId: number,
    rightEditorId: number,
};

const DividerStyles = styled.div`
    cursor: col-resize;
    user-select: none;
    width: 2px;
    flex-shrink: 0;
    background-color: rgb(var(--accent-color));
    margin: 0 5px;
`;


export default function Divider ({leftEditorId, rightEditorId}: EditorDividerProps) {
    const [leftEditor, leftDispatch] = deriveEditorFromId(leftEditorId);
    const [rightEditor, rightDispatch] = deriveEditorFromId(rightEditorId);
    const [dragging, setDragging] = useState(false);

    const ref = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!ref.current) return;

        let dragStart: number;
        let dragElem: HTMLDivElement;
        let diff: number | null = null;

        const onMouseMove = (e: MouseEvent) => {
            if (!(dragElem.firstChild instanceof HTMLSpanElement)) return;

            const offset = clamp(e.clientX, 0, window.innerWidth);

            diff = Math.round(offset - dragStart);
            diff = clamp(diff, -(leftEditor.width as number - MIN_WIDTH - 1), rightEditor.width as number - MIN_WIDTH);

            if (offset < dragStart) {
                diff -= 1; // account for width of divider

                dragElem.style.left = `${dragStart + diff}px`;
                dragElem.style.width = `${+diff}px`;
                dragElem.firstChild.innerHTML = `${diff}px`;

                dragElem.style.borderLeft = "2px solid rgb(var(--accent-color))";
                dragElem.style.borderRight = "none";
            } else if (offset > dragStart) {
                dragElem.style.left = `${dragStart + 3}px`;
                dragElem.style.width = `${diff - 3}px`;
                dragElem.firstChild.innerHTML = `+${diff}px`;

                dragElem.style.borderLeft = "none";
                dragElem.style.borderRight = "2px solid rgb(var(--accent-color))";
            } else {
                dragElem.style.left = `${dragStart}px`;
                dragElem.style.width = "3px";
                dragElem.firstChild.innerHTML = "";

                dragElem.style.borderLeft = "none";
                dragElem.style.borderRight = "none";

                diff = null;
            }
        };

        const onMouseup = () => {
            setDragging(false);
        };

        const endDragging = () => {
            document.body.style.cursor = "";
            if (dragElem) document.body.removeChild(dragElem);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseup);

            if (diff) {
                 leftDispatch({type: "resize", value:  leftEditor.width as number + diff});
                rightDispatch({type: "resize", value: rightEditor.width as number - diff});
                diff = null;
            }
        };

        if (dragging) {
            const rect = ref.current.getBoundingClientRect();
            dragStart = rect.left;

            document.body.style.cursor = "col-resize";

            dragElem = document.createElement("div");
            dragElem.style.display = "flex";
            dragElem.style.alignItems = "center";
            dragElem.style.justifyContent = "center";
            dragElem.style.position = "absolute";
            dragElem.style.bottom = "0";
            dragElem.style.left = `${dragStart}px`;
            dragElem.style.right = `${dragStart}px`;
            dragElem.style.height = `${rect.height}px`;
            dragElem.style.backgroundColor = "rgb(66, 66, 66, 0.6)";
            dragElem.style.zIndex = "1000";
            dragElem.style.pointerEvents = "none";

            const dragText = document.createElement("span");
            dragText.style.fontWeight = "bold";
            dragText.style.fontFamily = "monospace";
            dragText.style.background = "rgb(66, 66, 66, 0.6)";
            dragText.style.color = "white";
            dragText.style.borderRadius = "1em";
            dragText.style.padding = "0.25em";
            dragElem.appendChild(dragText);

            document.body.prepend(dragElem);

            window.addEventListener("mouseup", onMouseup);
            window.addEventListener("mousemove", onMouseMove);
        } else endDragging();

        return endDragging;
    }, [dragging]);


    return <DividerStyles
        ref={ref}
        onMouseDown={() => setDragging(true)}
    />;
}
