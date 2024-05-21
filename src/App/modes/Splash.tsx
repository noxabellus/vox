import styled from "styled-components";

import Svg from "Elements/Svg";
import ToolSet from "Elements/ToolSet";
import Button from "Elements/Button";

import { useApp } from "Model/App";

import logoImg from "Assets/vox.svg?raw";
import closeImg from "Assets/xmark.svg?raw";
import newFileImg from "Assets/file-pencil.svg?raw";
import openFileImg from "Assets/folder-arrow-down.svg?raw";
import settingsImg from "Assets/gear.svg?raw";
import githubImg from "Assets/github.svg?raw";
import kofiImg from "Assets/kofi.svg?raw";
import patreonImg from "Assets/patreon.svg?raw";
import itchImg from "Assets/itch-io.svg?raw";


const Body = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    -webkit-app-region: drag;
    & button, & nav {
        -webkit-app-region: no-drag;
    }
`;


const CustomSvg = styled(Svg)`
    background: rgb(var(--element-color));
    border: 1px solid rgb(var(--accent-color));
    border-radius: 20px;
    justify-self: center;
    padding: 40px;
    flex-grow: 0;

    & svg {
        width: calc(100vw - 82px);
        fill: rgb(var(--vox-color));
    }
`;

const ButtonPanel = styled(ToolSet)`
    margin-top: 5px;
    margin-right: 20px;
    align-self: flex-end;
    font-size: 24px;
`;

const LinkPanel = styled(ToolSet)`
    position: absolute;
    top: 314px;
    margin-left: 20px;
    align-self: flex-start;
    font-size: 14px;
`;

const CustomInlineIcon = styled(Button.InlineIcon)`
    position: absolute;
    top: 15px;
    right: 15px;
`;

function CloseButton () {
    const [_app, appDispatch] = useApp();
    return <CustomInlineIcon title="Close Vox [Alt+F4]" svg={closeImg} onClick={() => appDispatch({type: "close"})} />;
}


export default function Splash () {
    return <Body>
        <CloseButton />
        <CustomSvg src={logoImg} />
        <LinkPanel>
            <Button.Icon title="Vox on Github" svg={githubImg} onClick={() => window.open("https://github.com/noxabellus/vox")} />
            <Button.Icon title="Vox on Ko-fi" svg={kofiImg} onClick={() => window.open("https://ko-fi.com/TODO")} />
            <Button.Icon title="Vox on Patreon" svg={patreonImg} onClick={() => window.open("https://patreon.com/TODO")} />
            <Button.Icon title="Vox on Itch.io" svg={itchImg} onClick={() => window.open("https://itch.io/TODO")} />
        </LinkPanel>
        <ButtonPanel>
            <Button.Icon title="New Vox [Ctrl+N]" svg={newFileImg} />
            <Button.Icon title="Open Vox [Ctrl+O]" svg={openFileImg} />
            <Button.Icon title="User Settings [Ctrl+`]" svg={settingsImg} />
        </ButtonPanel>
    </Body>;
}
