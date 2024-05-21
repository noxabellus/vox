import RangeOf from "Support/RangeOf";
import { Editor } from "./Editor";


export * as Mode from "./Mode";


export type Mode
    = SplashMode
    | EditorMode
    | MultiEditorMode
    | UserSettingsMode
    ;

export type SplashMode = {
    name: "splash"
};

export type EditorMode = {
    name: "editor",
    editorId: Editor.Id
};

export type MultiEditorMode = {
    name: "multi-editor",
    editorIds: Editor.Id[],
};

export type UserSettingsMode = {
    name: "user-settings",
    lastMode: Mode,
};

export type ModeName = Mode["name"];
export const ModeNames = RangeOf<ModeName>()("splash", "editor", "multi-editor", "user-settings");

export type ModeTypes = { [K in ModeName]: Extract<Mode, {name: K}> };


export function isMode (mode: Mode): mode is Mode {
    return ModeNames.includes(mode.name as ModeName);
}

export function isSplashMode (mode: Mode): mode is SplashMode {
    return mode.name === "splash";
}

export function isEditorMode (mode: Mode): mode is EditorMode {
    return mode.name === "editor";
}

export function isMultiEditorMode (mode: Mode): mode is MultiEditorMode {
    return mode.name === "multi-editor";
}

export function isUserSettingsMode (mode: Mode): mode is UserSettingsMode {
    return mode.name === "user-settings";
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

export function asMultiEditorMode (mode: Mode): MultiEditorMode | undefined {
    if (isMultiEditorMode(mode)) return mode;
}

export function asUserSettingsMode (mode: Mode): UserSettingsMode | undefined {
    if (isUserSettingsMode(mode)) return mode;
}

export function isSpecifiedMode (mode: Mode, modeName: ModeName): mode is ModeTypes[typeof modeName] {
    return mode.name === modeName;
}

export function asSpecifiedMode (mode: Mode, modeName: ModeName): ModeTypes[typeof modeName] | undefined {
    if (isSpecifiedMode(mode, modeName)) return mode;
}
