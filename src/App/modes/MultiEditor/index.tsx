import { useEffect } from "react";

import { assert } from "Support/panic";

import { useApp } from "Model/App";
import { Editor as EditorModel, MIN_WIDTH } from "Model/Editor";

import Spacer from "Elements/Spacer";
import { Column, Row } from "Elements/layout";
import TitleBar from "Elements/TitleBar";

import Editor from "../Editor";

import Divider from "./Divider";
import { useWindow } from "Model/WindowInfo";


export type MultiEditorProps = {
    editorIds: EditorModel.Id[],
};


export default function MultiEditor ({editorIds}: MultiEditorProps) {
    const [_, windowDispatch] = useWindow();
    const [app, appDispatch] = useApp();

    windowDispatch({type: "set-minimum-size", value: [800, 600]});
    windowDispatch({type: "set-resizable", value: true});

    useEffect(() => {
        console.log("editorIds effect");

        windowDispatch({type: "set-minimum-size", value: [MIN_WIDTH * editorIds.length + (editorIds.length - 1) * 12, 600]});

        let size = window.innerWidth - (editorIds.length - 1) * 12;


        editorIds.forEach(editorId =>
            appDispatch({
                type: "editor-action",
                value: {
                    editorId: editorId,
                    editorAction: {type: "resize", value: size / editorIds.length},
                },
            }));

        const onResize = async () => {
            const newSize = window.innerWidth - (editorIds.length - 1) * 12;
            const oldSize = size;

            size = newSize;

            let total = 0;
            let sizes = editorIds.map(editorId => {
                const editor = app.editors.find(editor => editor.id === editorId);
                assert(editor !== undefined, "Editor not found", editorId);

                const edSize = Math.max(MIN_WIDTH, newSize * (editor.width as number / oldSize));
                total += edSize;
                return edSize;
            });

            if (total > newSize) {
                const overage = total - newSize;
                const numEditorsWithSizeToSpare = sizes.reduce((acc, size) => size > MIN_WIDTH ? acc + 1 : acc, 0);
                const delta = overage / numEditorsWithSizeToSpare;
                sizes = sizes.map(size => size > MIN_WIDTH ? size - delta : size);
            }

            editorIds.forEach((editorId, index) =>
                appDispatch({
                    type: "editor-action",
                    value: {
                        editorId: editorId,
                        editorAction: {type: "resize", value: sizes[index]},
                    },
                }));
        };

        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, [editorIds]);


    return <Column>
        <TitleBar />
        <Row>
            { editorIds.map((editorId, index) => {
                const elems = [
                    <Column key={`${editorId}-column`}>
                        <Spacer style={{maxHeight: "var(--gap)"}} />
                        <Editor key={editorId} editorId={editorId} />
                    </Column>
                ];

                if (index < editorIds.length - 1) {
                    elems.push(
                        <Divider
                            key={`divider-${index}`}
                            leftEditorId={editorId}
                            rightEditorId={editorIds[index + 1]}
                        />
                    );
                }

                return elems;
            })}
        </Row>
    </Column>;
}
