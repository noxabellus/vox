import * as remote from "Support/remote";
import RangeOf from "Support/RangeOf";
import { Vec2 } from "Support/math";
import { assert, unreachable } from "Support/panic";
import { createContext, useContext, useSyncExternalStore } from "react";


export * as WindowInfo from "./WindowInfo";


export type WindowInfo = {
    size: Vec2,
    minimumSize: Vec2,
    position: Vec2,
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
    | SetWindowPosition
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

export type SetWindowPosition = {
    type: "set-window-position",
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
export const ActionTypes = RangeOf<ActionType>()("set-window-size", "set-window-minimum-size", "set-window-position", "set-window-state", "set-window-mode");

export function isAction (value: any): value is Action {
    return value && ActionTypes.includes(value.type);
}


export type WindowModeName = WindowMode["name"];
export const WindowModeNames = RangeOf<WindowModeName>()("widget", "edit");

export function isWindowMode (value: any): value is WindowMode {
    return value && WindowModeNames.includes(value.name);
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
    position: [0, 0],
    mode: {name: "widget"},
    lastState: "normal",
};

let LISTENER: (() => void) | null = null;

function subscribe (listener: () => void) {
    assert(LISTENER === null, "WindowInfo listener already exists");

    INFO = DEFAULT_INFO;

    stateUpdate(INFO);

    LISTENER = listener;

    const resizeHandler = () => emit({type: "set-window-size", value: remote.window.getSize() as Vec2});
    const moveHandler = () => emit({type: "set-window-position", value: remote.window.getPosition() as Vec2});
    const maximizeHandler = () => emit({type: "set-window-state", value: "maximized"});
    const unmaximizeHandler = () => emit({type: "set-window-state", value: INFO.lastState});
    const minimizeHandler = () => emit({type: "set-window-state", value: "minimized"});
    const restoreHandler = () => emit({type: "set-window-state", value: INFO.lastState});
    const enterFullScreenHandler = () => emit({type: "set-window-state", value: "fullscreen"});
    const leaveFullScreenHandler = () => emit({type: "set-window-state", value: INFO.lastState});

    remote.window.on("resize", resizeHandler);
    remote.window.on("move", moveHandler);
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
            remote.window.off("move", moveHandler);
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
};

function getSnapshot (): WindowInfo {
    return INFO;
};

function dispatch (action: Action) {
    INFO = reducer(INFO, action, true);

    LISTENER?.();
}

function emit (action: Action) {
    INFO = reducer(INFO, action, false);

    LISTENER?.();
}

function reducer (state: WindowInfo, action: Action, pushState: boolean): WindowInfo {
    const out = {...state};

    switch (action.type) {
        case "set-window-size": {
            out.size = action.value;

            if (pushState) remote.window.setSize(action.value[0], action.value[1], false);
        } break;

        case "set-window-position": {
            out.position = action.value;

            if (pushState) remote.window.setPosition(action.value[0], action.value[1]);
        } break;

        case "set-window-state": {
            assert(out.mode.name === "edit");

            out.lastState = out.mode.state;
            out.mode.state = action.value;

            if (pushState) stateUpdate(out);
        } break;

        case "set-window-mode": {
            if (action.value === "edit" && out.mode.name !== "edit") {
                out.mode = {name: "edit", state: out.lastState};
            } else if (action.value === "widget" && out.mode.name !== "widget") {
                out.lastState = out.mode.state;
                out.mode = {name: "widget"};
            } else break;

            if (pushState) stateUpdate(out);
        } break;

        default: unreachable("Invalid WindowInfo Action", action);
    }

    return out;
}

function stateUpdate (info: WindowInfo) {
    switch (info.mode.name) {
        case "widget": {
            remote.window.restore();
            remote.window.setFullScreen(false);
            remote.window.unmaximize();
            remote.window.setMinimumSize(...info.minimumSize);
            remote.window.setSize(...info.size, false);
            remote.window.setResizable(false);
            remote.window.setMinimumSize(...info.minimumSize);
            remote.window.setPosition(...info.position);
        } break;

        case "edit": {
            if (info.mode.state !== "fullscreen") remote.window.setFullScreen(false);

            switch (info.mode.state) {
                case "normal": {
                    remote.window.restore();
                    remote.window.unmaximize();
                    remote.window.setMinimumSize(...info.minimumSize);
                    remote.window.setSize(...info.size, false);
                    remote.window.setResizable(true);
                    remote.window.setMinimumSize(...info.minimumSize);
                    remote.window.setPosition(...info.position);
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
}
