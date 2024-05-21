import styled from "styled-components";

import PropsOf from "Support/PropsOf";

import { useApp } from "Model/App";

import ToolSet from "Elements/ToolSet";
import Button from "Elements/Button";

import closeImg from "Assets/xmark.svg?raw";


export type TitleBarProps = LocalTitleBarProps & PropsOf<typeof CustomToolSet>;

type LocalTitleBarProps = {};


const CustomToolSet = styled(ToolSet)`
    font-family: var(--mono-family);
    font-size: .75em;
    justify-content: space-between;
    -webkit-app-region: drag;

    & button {
        -webkit-app-region: no-drag;
    }
`;


export default function TitleBar (props: TitleBarProps) {
    const [_app, appDispatch] = useApp();
    return <CustomToolSet {...props}>
        <h1>Vox</h1>
        <Button.InlineIcon svg={closeImg} onClick={() => appDispatch({type: "close"})} />
    </CustomToolSet>;
}
