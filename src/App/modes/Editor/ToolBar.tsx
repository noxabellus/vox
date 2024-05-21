import PropsOf from "Support/PropsOf";

import { CSSShapeNames, TextMarks, TextShapeType } from "Document/Text";

import { useApp } from "Model/App";
import { deriveEditorFromApp } from "Model/Editor";
import { Api } from "Model/Slate";

import Spacer from "Elements/Spacer";
import ToolSet from "Elements/ToolSet";
import Button from "Elements/Button";

import closeImg from "Assets/xmark.svg?raw";


export type ToolBarProps = LocalToolBarProps & PropsOf<typeof ToolSet>;

type LocalToolBarProps = {
    disabled: boolean,
    textMarks: Partial<TextMarks>,
};


export default function ToolBar ({disabled, textMarks, children, ...props}: ToolBarProps) {
    const [app, appDispatch] = useApp();
    const [editor, editorDispatch] = deriveEditorFromApp(app, appDispatch);


    const ShapeButton = ({type}: {type: TextShapeType}) =>
        <Button.Serif
            disabled={disabled}
            style={{[CSSShapeNames[type]]: type}}
            className={textMarks[type] ? "selected" : ""}
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
        >{type.slice(0, 1).toUpperCase()}</Button.Serif>;


    return <ToolSet style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}} {...props}>
        <h1 style={{userSelect: "none"}}
            onMouseDown={e => e.preventDefault()} // prevent editor from losing focus
            onClick={() => editorDispatch({type: "set-title", value: "a new title"})}
        >{editor.title}</h1>
        <Spacer />
        <ShapeButton type="bold" />
        <ShapeButton type="italic" />
        <ShapeButton type="underline" />
        <Spacer />
        {children}
        <Spacer/>
        <Button.InlineIcon svg={closeImg} onClick={() => appDispatch({type: "close", value: editor.id})} />
    </ToolSet>;
}
