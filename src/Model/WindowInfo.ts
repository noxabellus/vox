import * as remote from "Support/remote";
import RangeOf from "Support/RangeOf";
import { Vec2, v2add, v2comp, v2divS, v2sub } from "Support/math";
import { assert, unreachable } from "Support/panic";
import { createContext, useContext, useSyncExternalStore } from "react";


export * as WindowInfo from "./WindowInfo";


export type WindowInfo = {
    size: Vec2,
    minimumSize: Vec2,
    mode: WindowMode
    lastState: WindowState,
};


export type WindowMode
    = WidgetMode
    | EditMode
    ;

export type WidgetMode = {
    name: "widget"
};

export type EditMode = {
    name: "edit",
    state: WindowState,
};


export type Action
    = SetWindowSize
    | SetWindowMinimumSize
    | SetWindowState
    | SetWindowMode
    ;

export type SetWindowSize = {
    type: "set-window-size",
    value: Vec2,
};

export type SetWindowMinimumSize = {
    type: "set-window-minimum-size",
    value: Vec2,
};

export type SetWindowState = {
    type: "set-window-state",
    value: WindowState,
};

export type SetWindowMode = {
    type: "set-window-mode",
    value: WindowModeName,
};


export type ActionType = Action["type"];
export const ActionTypes = RangeOf<ActionType>()("set-window-size", "set-window-minimum-size", "set-window-state", "set-window-mode");

export function isAction (value: any): value is Action {
    return value && ActionTypes.includes(value.type);
}


export type WindowModeName = WindowMode["name"];
export const WindowModeNames = RangeOf<WindowModeName>()("widget", "edit");

export function isWindowMode (value: any): value is WindowMode {
    return value && WindowModeNames.includes(value.name);
}

export function isWidgetMode (value: WindowMode): value is WidgetMode {
    return value.name === "widget";
}

export function isEditMode (value: WindowMode): value is EditMode {
    return value.name === "edit";
}




export const WindowStates = ["normal", "maximized", "minimized", "fullscreen"] as const;
export type WindowState = typeof WindowStates[number];

export function isWindowState (value: any): value is WindowState {
    return WindowStates.includes(value);
}


const Ctx = createContext<WindowInfo>(undefined as any);
export const Provider = Ctx.Provider;

export function useStore (defaultInfo: WindowInfo) {
    DEFAULT_INFO = defaultInfo;
    return useSyncExternalStore(subscribe, getSnapshot);
}

export function useWindow(): [WindowInfo, (action: Action) => void] {
    return [useContext(Ctx), dispatch];
}

let DEFAULT_INFO: WindowInfo = undefined as any;

let INFO: WindowInfo = {
    size: [1, 1],
    minimumSize: [1, 1],
    mode: {name: "widget"},
    lastState: "normal",
};

let LISTENER: (() => void) | null = null;

let STATE_UPDATE = false;

function subscribe (listener: () => void) {
    assert(LISTENER === null, "WindowInfo listener already exists");

    INFO = DEFAULT_INFO;

    stateUpdate(INFO);

    LISTENER = listener;

    const resizeHandler = () => emit({type: "set-window-size", value: remote.window.getSize() as Vec2});
    const maximizeHandler = () => emit({type: "set-window-state", value: "maximized"});
    const unmaximizeHandler = () => emit({type: "set-window-state", value: INFO.lastState});
    const minimizeHandler = () => emit({type: "set-window-state", value: "minimized"});
    const restoreHandler = () => emit({type: "set-window-state", value: INFO.lastState});
    const enterFullScreenHandler = () => emit({type: "set-window-state", value: "fullscreen"});
    const leaveFullScreenHandler = () => emit({type: "set-window-state", value: INFO.lastState});

    remote.window.on("resize", resizeHandler);
    remote.window.on("maximize", maximizeHandler);
    remote.window.on("unmaximize", unmaximizeHandler);
    remote.window.on("minimize", minimizeHandler);
    remote.window.on("restore", restoreHandler);
    remote.window.on("enter-full-screen", enterFullScreenHandler);
    remote.window.on("leave-full-screen", leaveFullScreenHandler);

    const teardown = () => {
        if (LISTENER === listener) {
            LISTENER = null;

            remote.window.off("resize", resizeHandler);
            remote.window.off("maximize", maximizeHandler);
            remote.window.off("unmaximize", unmaximizeHandler);
            remote.window.off("minimize", minimizeHandler);
            remote.window.off("restore", restoreHandler);
            remote.window.off("enter-full-screen", enterFullScreenHandler);
            remote.window.off("leave-full-screen", leaveFullScreenHandler);

            window.removeEventListener("beforeunload", teardown);
        }
    };

    window.addEventListener("beforeunload", teardown);

    return teardown;
}

function getSnapshot (): WindowInfo {
    return INFO;
}


function dispatch (action: Action) {
    const updated = reducer(action, true);

    if (updated) LISTENER?.();
}

function emit (action: Action) {
    if (STATE_UPDATE) return;

    const updated = reducer(action, false);

    if (updated) LISTENER?.();
}

function reducer (action: Action, pushState: boolean): boolean {
    switch (action.type) {
        case "set-window-size": {
            if (v2comp(INFO.size, action.value)) return false;
            INFO.size = action.value;
            if (INFO.size[0] < INFO.minimumSize[0]) INFO.minimumSize[0] = INFO.size[0];
            if (INFO.size[1] < INFO.minimumSize[1]) INFO.minimumSize[1] = INFO.size[1];
        } break;

        case "set-window-minimum-size": {
            if (v2comp(INFO.minimumSize, action.value)) return false;
            INFO.minimumSize = action.value;
            if (INFO.size[0] < action.value[0]) INFO.size[0] = action.value[0];
            if (INFO.size[1] < action.value[1]) INFO.size[1] = action.value[1];
        } break;

        case "set-window-state": {
            assert(INFO.mode.name === "edit");

            if (INFO.mode.state === action.value) return false;
            INFO.lastState = INFO.mode.state;
            INFO.mode.state = action.value;
        } break;

        case "set-window-mode": {
            if (action.value === "edit" && INFO.mode.name !== "edit") {
                INFO.mode = {name: "edit", state: INFO.lastState};
            } else if (action.value === "widget" && INFO.mode.name !== "widget") {
                INFO.lastState = INFO.mode.state;
                INFO.mode = {name: "widget"};
            } else return false;
        } break;

        default: unreachable("Invalid WindowInfo Action", action);
    }

    if (pushState) stateUpdate(INFO);

    return true;
}

function stateUpdate (info: WindowInfo) {
    STATE_UPDATE = true;

    switch (info.mode.name) {
        case "widget": {
            remote.window.restore();
            remote.window.setFullScreen(false);
            remote.window.unmaximize();

            const prevPos = remote.window.getPosition() as Vec2;
            const prevSize = remote.window.getSize() as Vec2;
            const prevCen = v2add(prevPos, v2divS(prevSize, 2));

            remote.window.setMinimumSize(...info.minimumSize);
            remote.window.setSize(...info.size, false);
            remote.window.setResizable(false);
            remote.window.setMinimumSize(...info.minimumSize);

            const newSize = remote.window.getSize() as Vec2;
            if (!v2comp(prevSize, newSize)) {
                remote.window.setPosition(...v2sub(prevCen, v2divS(newSize, 2)));
            }
        } break;

        case "edit": {
            if (info.mode.state !== "fullscreen") remote.window.setFullScreen(false);

            switch (info.mode.state) {
                case "normal": {
                    remote.window.restore();
                    remote.window.unmaximize();

                    const prevPos = remote.window.getPosition() as Vec2;
                    const prevSize = remote.window.getSize() as Vec2;
                    const prevCen = v2add(prevPos, v2divS(prevSize, 2));

                    remote.window.setMinimumSize(...info.minimumSize);
                    remote.window.setSize(...info.size, false);
                    remote.window.setResizable(true);
                    remote.window.setMinimumSize(...info.minimumSize);

                    const newSize = remote.window.getSize() as Vec2;
                    if (!v2comp(prevSize, newSize)) {
                        remote.window.setPosition(...v2sub(prevCen, v2divS(newSize, 2)));
                    }
                } break;

                case "maximized": {
                    remote.window.restore();
                    remote.window.maximize();
                } break;

                case "minimized": {
                    remote.window.minimize();
                } break;

                case "fullscreen": {
                    remote.window.restore();
                    remote.window.setFullScreen(true);
                } break;
            }
        } break;

        default: unreachable("Invalid WindowMode", info.mode);
    }

    setTimeout(() => { STATE_UPDATE = false; });
}
