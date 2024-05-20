import styled from "styled-components";

import PropsOf from "Support/PropsOf";

import ToolSet from "Elements/ToolSet";

import { showSelection, Selection, Api } from "Model/Slate";
import { useEditor } from "Model/Editor";
import { fragmentWords } from "Document/util";


export type StatusBarProps = LocalStatusBarProps & PropsOf<typeof CustomToolSet>;

type LocalStatusBarProps = {
    focused: boolean,
    selected: Selection,
};

const CustomToolSet = styled(ToolSet)`
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    font-family: var(--mono-family);
    font-size: .5em;
    justify-content: space-between;
`;


export default function StatusBar ({focused, selected, ...props}: StatusBarProps) {
    const [editor] = useEditor();

    const selectedWords = selected? fragmentWords(Api.fragment(editor.slate, selected)) : 0;
    const totalWords = fragmentWords(editor.slate.children);

    return <CustomToolSet {...props}>
        <span>Selected: {showSelection(selected)}</span>
        <span>Word count: {selectedWords} / {totalWords}</span>
        <span>Focused: {focused? "✓" : "⛌"}</span>
    </CustomToolSet>;
}
