import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { deriveEditorFromId } from "Model/Editor";


export type EditorDividerProps = {
    leftEditorId: number,
    rightEditorId: number,
};

const DividerStyles = styled.div`
    cursor: col-resize;
    user-select: none;
    width: 3px;
    background-color: #FF00FF;
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

            const offset = e.clientX;

            diff = offset - dragStart;

            if (offset < dragStart) {
                dragElem.style.left = `${offset}px`;
                dragElem.style.width = `${dragStart - offset}px`;
                dragElem.firstChild.innerHTML = `${diff}px`;
            } else if (offset > dragStart) {
                dragElem.style.left = `${dragStart + 3}px`;
                dragElem.style.width = `${offset - dragStart - 3}px`;
                dragElem.firstChild.innerHTML = `+${diff}px`;
            } else {
                dragElem.style.left = `${dragStart}px`;
                dragElem.style.width = "3px";
                dragElem.firstChild.innerHTML = "";
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
                leftDispatch({type: "resize", value:  leftEditor.width + diff});
                rightDispatch({type: "resize", value: rightEditor.width - diff});
            }
        };

        if (dragging) {
            dragStart = ref.current.getBoundingClientRect().left;

            document.body.style.cursor = "col-resize";

            dragElem = document.createElement("div");
            dragElem.style.display = "flex";
            dragElem.style.alignItems = "center";
            dragElem.style.justifyContent = "center";
            dragElem.style.position = "absolute";
            dragElem.style.top = "0";
            dragElem.style.left = `${dragStart}px`;
            dragElem.style.right = `${dragStart}px`;
            dragElem.style.height = "100%";
            dragElem.style.backgroundColor = "rgb(66, 66, 66, 0.6)";
            dragElem.style.borderLeft = "2px solid #FF00FF";
            dragElem.style.borderRight = "2px solid #FF00FF";
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
