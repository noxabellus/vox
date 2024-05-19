import { CSSShapeNames, TextMarks, TextShapeType } from "Document/Text";
import Spacer from "Elements/Spacer";
import ToolSet from "Elements/ToolSet";
import { useEditor } from "Model/Editor";
import { Api } from "Model/Slate";
import PropsOf from "Support/PropsOf";


export type ToolBarProps = LocalToolBarProps & PropsOf<typeof ToolSet>;

type LocalToolBarProps = {
    textMarks: Partial<TextMarks>,
};


export default function ToolBar ({textMarks, ...props}: ToolBarProps) {
    const [editor, editorDispatch] = useEditor();

    const ShapeButton = ({type}: {type: TextShapeType}) =>
        <button
            style={{cursor: "pointer", [CSSShapeNames[type]]: type, color: textMarks[type] ? "blue" : "gray"}}
            onMouseDown={e => e.preventDefault()}
            onClick={async () =>
                editorDispatch({
                    type: "slate-action",
                    value: slate => {
                        if (textMarks[type]) {
                            Api.removeMark(slate, type);
                        } else {
                            Api.addMark(slate, type, true);
                        }
                    },
                })
            }
        >{type.slice(0, 1).toUpperCase()}</button>;


    return <ToolSet {...props}>
        <h1 style={{userSelect: "none"}}
            onMouseDown={e => e.preventDefault()} // prevent editor from losing focus
            onClick={() => editorDispatch({type: "set-title", value: "a new title"})}
        >{editor.title}</h1>
        <Spacer />
        <ShapeButton type="bold" />
        <ShapeButton type="italic" />
        <ShapeButton type="underline" />
        <Spacer />
    </ToolSet>;
}
