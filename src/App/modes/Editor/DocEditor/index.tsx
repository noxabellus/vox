import { useCallback } from "react";
import { Editable, useSlateStatic } from "slate-react";

import { Editor, Api } from "../slate";

import leafRenderer from "./renderers/leaf";
import elementRenderer from "./renderers/element";



function handleKeyDown(e: React.KeyboardEvent, editor: Editor) {
    if (e.ctrlKey || e.altKey) e.preventDefault();

    if (e.key === "z" && e.ctrlKey) {
        Api.undo(editor);
    } else if (e.key === "y" && e.ctrlKey) {
        Api.redo(editor);
    }
}


export default function DocEditor () {
    const editor = useSlateStatic();

    const renderLeaf = useCallback(leafRenderer, []);
    const renderElement = useCallback(elementRenderer, []);

    return <Editable
        onKeyDown={e => handleKeyDown(e, editor)}

        renderLeaf={renderLeaf}
        renderElement={renderElement}
    />;
}
