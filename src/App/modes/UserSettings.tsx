import styled from "styled-components";

import { Column } from "Elements/layout";
import ScrollRegion from "Elements/ScrollRegion";
import TitleBar from "Elements/TitleBar";
import Button from "Elements/Button";

import { useApp } from "Model/App";
import { UserSettingsMode } from "Model/Mode";
import { useWindow } from "Model/WindowInfo";

import backImg from "Assets/arrow-curve-180.svg?raw";
import ToolSet from "Elements/ToolSet";


const CustomScrollRegion = styled(ScrollRegion).attrs<{$inset: boolean}>(({$inset}) => ({
    style: {
        "--track-height": $inset? "calc(100% - ((.75em + var(--gap) * 2 + 2px) * 2 + var(--gap) * 3))" : "calc(100% - var(--gap) * 4)",
    } as any,
}))`
    border-top: none;
    border-bottom-left-radius: var(--minor-border-radius);
    border-bottom-right-radius: var(--minor-border-radius);

    & .ScrollbarsCustom-TrackY {
        height: var(--track-height);
    }
`;

const CustomToolSet = styled(ToolSet).attrs<{$inset: boolean}>(({$inset}) => ({
    style: {
        "--inset-pos": $inset? "absolute" : "relative",
        "--inset-top": $inset? "calc(100% - ((.75em + var(--gap) * 2 + 2px) + var(--gap) * 5))" : "0",
    } as any,
}))`
    position: var(--inset-pos);
    top: var(--inset-top);
    align-self: flex-end;
    justify-self: flex-end;
    margin: var(--gap);
`;


export default function UserSettings () {
    const [windowInfo, _windowDispatch, windowDispatchOnce] = useWindow();
    const [app, appDispatch] = useApp();
    const lastMode = (app.mode as UserSettingsMode).lastMode;

    windowDispatchOnce({type: "set-minimum-size", value: [800, 600]});
    windowDispatchOnce({type: "set-resizable", value: true});

    const inset = windowInfo.state != "normal";

    return <Column>
        <TitleBar title="Vox User Settings" style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}} />
        <CustomScrollRegion $inset={inset}>
            <div style={{height: "2000px"}} />
        </CustomScrollRegion>
        <CustomToolSet $inset={inset}>
            <Button.Icon title={`Return to ${lastMode.name} [Alt+Backspace]`} svg={backImg} onClick={() => appDispatch({type: "switch-mode", value: lastMode})} />
        </CustomToolSet>
    </Column>;
}
