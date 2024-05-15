import RangeOf from "Support/RangeOf";
import { Editor } from "./Editor";


export * as Mode from "./Mode";


export type Mode
    = SplashMode
    | EditorMode
    | UserSettingsMode
    ;

export type SplashMode = {
    name: "splash"
};

export type EditorMode = {
    name: "editor",
    editorId: Editor.Id
};

export type UserSettingsMode = {
    name: "userSettings",
    lastMode: Mode,
};

export type ModeName = Mode["name"];

type Modes = { [K in ModeName]: Mode };
class ModeTypes implements Modes {
    splash: SplashMode;
    editor: EditorMode;
    userSettings: UserSettingsMode;
};


export const ModeNames = RangeOf<ModeName>()("splash", "editor", "userSettings");


export function isMode (mode: Mode): mode is Mode {
    return ModeNames.includes(mode.name as ModeName);
}

export function isSplashMode (mode: Mode): mode is SplashMode {
    return mode.name === "splash";
}

export function isEditorMode (mode: Mode): mode is EditorMode {
    return mode.name === "editor";
}

export function isUserSettingsMode (mode: Mode): mode is UserSettingsMode {
    return mode.name === "userSettings";
}

export function asMode (mode: Mode): Mode | undefined {
    if (isMode(mode)) return mode;
}

export function asSplashMode (mode: Mode): SplashMode | undefined {
    if (isSplashMode(mode)) return mode;
}

export function asEditorMode (mode: Mode): EditorMode | undefined {
    if (isEditorMode(mode)) return mode;
}

export function asUserSettingsMode (mode: Mode): UserSettingsMode | undefined {
    if (isUserSettingsMode(mode)) return mode;
}

export function isSpecifiedMode (mode: Mode, modeName: ModeName): mode is ModeTypes[typeof modeName] {
    return mode.name === modeName;
}
