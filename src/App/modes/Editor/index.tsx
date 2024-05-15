import { Scrollbar } from "react-scrollbars-custom";
import { IdProvider, deriveEditorFromId } from "Model/Editor";
import DocEditor from "./DocumentEditor";
import styled from "styled-components";


export type EditorProps = {
    editorId: number,
};


const EditorBody = styled(Scrollbar)`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;

    & .ScrollbarsCustom-Wrapper {
        flex-grow: 1;
        inset: 0px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: stretch;
    }

    & .ScrollbarsCustom-Scroller {
        /* align-self: stretch;
        justify-self: stretch;
        width: fit-content;
        flex-grow: 1; */
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: stretch;
    }

    & .ScrollbarsCustom-Content {
        display: flex;
        min-width: max-content;
        flex-grow: 1;
        background: blue;
        align-self: stretch;
        justify-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    & .ScrollbarsCustom-Track {
        position: absolute;
        overflow: hidden;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.2);
        user-select: none;
    }

    & .ScrollbarsCustom-TrackY {
        width: 10px;
        height: calc(100% - 60px);
        top: 30px;
        right: 10px;
    }

    & .ScrollbarsCustom-TrackX {
        height: 10px;
        width: calc(100% - 60px);
        bottom: 10px;
        left: 30px;
    }

    & .ScrollbarsCustom-Thumb {
        border-radius: 4px;
        background: rgba(255, 0, 255, 0.3);
    }

    & .ScrollbarsCustom-ThumbY {
        width: 100%;
    }

    & .ScrollbarsCustom-ThumbX {
        height: 100%;
    }
`;


export default function Editor ({editorId}: EditorProps) {
    const [editor, editorDispatch] = deriveEditorFromId(editorId);

    console.log("Editor Mode");

    return <IdProvider key={`idProvider${editorId}`} value={editorId}>
        <h1 style={{userSelect: "none"}}
            onMouseDown={e => e.preventDefault()} // prevent editor from losing focus
            onClick={() => editorDispatch({type: "set-title", value: "a new title"})}
        >{editor.title}</h1>
        <EditorBody
            key={`editorBody${editorId}`}
            disableTracksWidthCompensation={true}
            noDefaultStyles={true}
        >
            <DocEditor key={`docEditor${editorId}`} />
        </EditorBody>
    </IdProvider>;
}

