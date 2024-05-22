import styled from "styled-components";

import { Column } from "Elements/layout";
import ScrollRegion from "Elements/ScrollRegion";
import TitleBar from "Elements/TitleBar";
import Button from "Elements/Button";

import { useApp } from "Model/App";
import { UserSettingsMode } from "Model/Mode";

import backImg from "Assets/arrow-curve-180.svg?raw";
import ToolSet from "Elements/ToolSet";


const CustomScrollRegion = styled(ScrollRegion)`
    border-top: none;
    border-bottom-left-radius: var(--minor-border-radius);
    border-bottom-right-radius: var(--minor-border-radius);

    & .ScrollbarsCustom-TrackY {
        top: calc((.75em + var(--gap) * 2 + 2px) * 2 + var(--gap));
        height: calc(100% - ((.75em + var(--gap) * 2 + 2px) * 2 + var(--gap) * 3));
    }
`;

const CustomToolSet = styled(ToolSet)`
    position: absolute;
    top: calc(.75em + var(--gap) * 2 + 2px);
    align-self: flex-end;
    justify-self: flex-end;
    margin: var(--gap);
`;


export default function UserSettings () {
    const [app, appDispatch] = useApp();
    const lastMode = (app.mode as UserSettingsMode).lastMode;
    // remote.setWindowSizeMemo(800, 600);

    return <Column>
        <TitleBar title="Vox User Settings" style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}} />
        <CustomScrollRegion>
            <div style={{height: "2000px"}} />
        </CustomScrollRegion>
        <CustomToolSet>
            <Button.Icon title={`Return to ${lastMode.name} [Alt+Backspace]`} svg={backImg} onClick={() => appDispatch({type: "switch-mode", value: lastMode})} />
        </CustomToolSet>
    </Column>;
}
