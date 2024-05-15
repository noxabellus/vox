import { IdProvider, deriveEditorFromId } from "Model/Editor";
import DocEditor from "./DocumentEditor";
import styled from "styled-components";


export type EditorProps = {
    editorId: number,
};


const EditorBody = styled.div`
    background: grey;
    align-self: stretch;
    justify-self: stretch;
    flex-grow: 1;
`;


export default function Editor ({editorId}: EditorProps) {
    const [editor, editorDispatch] = deriveEditorFromId(editorId);

    console.log("Editor Mode");

    return <IdProvider key={`idProvider${editorId}`} value={editorId}>
        <h1 style={{userSelect: "none"}}
            onMouseDown={e => e.preventDefault()} // prevent editor from losing focus
            onClick={() => editorDispatch({type: "set-title", value: "a new title"})}
        >{editor.title}</h1>
        <EditorBody key={`editorBody${editorId}`}>
            <DocEditor key={`docEditor${editorId}`} />
        </EditorBody>
    </IdProvider>;
}

