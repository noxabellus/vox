import { App } from "./App";


export * as KeyBindings from "./KeyBindings";


export type KeyBindings = Partial<Record<KeyCombo, KeyAction>>;

export type ModifierString = typeof ModifierStrings[number];

export const ModifierStrings = ["Ctrl", "Alt", "Shift", "Ctrl+Alt", "Ctrl+Shift", "Alt+Shift"] as const;

export type Key = typeof Keys[number];

export const Keys =
    [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
    , "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    , "ARROWUP", "ARROWDOWN", "ARROWLEFT", "ARROWRIGHT"
    , "BACKSPACE", "DELETE", "ENTER", "ESCAPE", "TAB"
    , "SPACE"
    , "PAGEUP", "PAGEDOWN", "HOME", "END"
    ] as const;

export type KeyCombo = `${ModifierString}+${Key}` | Key;

export type KeyAction = (state: App, dispatch: App.Dispatch) => Promise<void>;
