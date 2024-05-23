import * as remote from "Support/remote";
import RangeOf from "Support/RangeOf";
import { Vec2 } from "Support/math";
import { assert, unreachable } from "Support/panic";
import { createContext, useContext, useMemo, useSyncExternalStore } from "react";


export * as WindowInfo from "./WindowInfo";


export type WindowInfo = {
    size: Vec2,
    minimumSize: Vec2,
    resizable: boolean,
    state: State,
    lastState: State,
};


export type Action
    = SetSize
    | SetMinimumSize
    | SetState
    | SetResizable
    | PostSize
    | PostState
    ;

export type SetSize = {
    type: "set-size",
    value: Vec2,
};

export type SetMinimumSize = {
    type: "set-minimum-size",
    value: Vec2,
};

export type SetState = {
    type: "set-state",
    value: State,
};

export type SetResizable = {
    type: "set-resizable",
    value: boolean,
};

export type PostSize = {
    type: "post-size",
    value: Vec2,
};

export type PostState = {
    type: "post-state",
    value: State,
};


export type ActionType = Action["type"];
export const ActionTypes = RangeOf<ActionType>()("set-size", "set-minimum-size", "set-state", "set-resizable", "post-size", "post-state");

export function isAction (value: any): value is Action {
    return value && ActionTypes.includes(value.type);
}




export const States = ["normal", "maximized", "minimized", "fullscreen"] as const;
export type State = typeof States[number];

export function isState (value: any): value is State {
    return States.includes(value);
}

function getWindowState (): State {
    return remote.window.isMaximized() ? "maximized" : remote.window.isMinimized() ? "minimized" : remote.window.isFullScreen() ? "fullscreen" : "normal";
}

function setWindowState (state: State) {
    switch (state) {
        case "normal": {
            remote.window.restore();
            remote.window.unmaximize();
            remote.window.setFullScreen(false);
        } break;

        case "maximized": {
            remote.window.maximize();
        } break;

        case "minimized": {
            remote.window.minimize();
        } break;

        case "fullscreen": {
            remote.window.setFullScreen(true);
        } break;

        default: unreachable("Invalid WindowState", state);
    }
}


const Ctx = createContext<WindowInfo>(undefined as any);
export const Provider = Ctx.Provider;

export function useStore () {
    return useSyncExternalStore(subscribe, getSnapshot);
}

export function useWindow(): [WindowInfo, (action: Action) => void, (action: Action) => void] {
    return [useContext(Ctx), dispatch, (action: Action) => useMemo(() => {
        console.log("windowDispatch once");
        dispatch(action);
    }, [])];
}

let INFO: WindowInfo = {
    size: [1, 1],
    minimumSize: [1, 1],
    state: "normal",
    lastState: "normal",
    resizable: true,
};

let LISTENER: (() => void) | null = null;

function subscribe (listener: () => void) {
    assert(LISTENER === null, "WindowInfo listener already exists");

    INFO.size = remote.window.getSize() as Vec2;
    INFO.minimumSize = remote.window.getMinimumSize() as Vec2;
    INFO.resizable = remote.window.isResizable();
    INFO.state = getWindowState();

    console.log("subscribe", INFO);

    LISTENER = listener;

    const eventHandler = (handler: () => void): () => void => {
        return () => {
            handler();
            INFO = {...INFO};
            LISTENER?.();
        };
    };

    const resizeHandler = eventHandler(() => dispatch({type: "post-size", value: remote.window.getSize() as Vec2}));
    const maximizeHandler = eventHandler(() => dispatch({type: "post-state", value: "maximized"}));
    const unmaximizeHandler = eventHandler(() => dispatch({type: "post-state", value: INFO.lastState}));
    const minimizeHandler = eventHandler(() => dispatch({type: "post-state", value: "minimized"}));
    const restoreHandler = eventHandler(() => dispatch({type: "post-state", value: INFO.lastState}));
    const enterFullScreenHandler = eventHandler(() => dispatch({type: "post-state", value: "fullscreen"}));
    const leaveFullScreenHandler = eventHandler(() => dispatch({type: "post-state", value: INFO.lastState}));

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
    switch (action.type) {
        case "set-size": {
            console.log("setting size", action.value, INFO.size, INFO.resizable, INFO.state);

            INFO.size[0] = action.value[0];
            INFO.size[1] = action.value[1];

            if (INFO.size[0] < INFO.minimumSize[0] || INFO.size[1] < INFO.minimumSize[1]) {
                INFO.minimumSize[0] = INFO.size[0];
                INFO.minimumSize[1] = INFO.size[1];

                remote.window.setMinimumSize(...INFO.minimumSize);
            }

            remote.window.setSize(...INFO.size, false);
        } break;

        case "set-minimum-size": {
            console.log("setting minimum size", action.value, INFO.state);

            INFO.minimumSize[0] = action.value[0];
            INFO.minimumSize[1] = action.value[1];

            remote.window.setMinimumSize(...INFO.minimumSize);

            if (INFO.size[0] < INFO.minimumSize[0] || INFO.size[1] < INFO.minimumSize[1]) {
                INFO.size[0] = INFO.minimumSize[0];
                INFO.size[1] = INFO.minimumSize[1];

                remote.window.setSize(...INFO.size, false);
            }
        } break;

        case "set-state": {
            console.log("setting state", action.value, INFO.state);

            INFO.lastState = getWindowState();
            INFO.state = action.value;

            setWindowState(INFO.state);
        } break;

        case "set-resizable": {
            console.log("setting resizable", action.value, INFO.state);

            INFO.resizable = action.value;

            remote.window.setResizable(INFO.resizable);
        } break;

        case "post-size": {
            console.log("posting size", action.value, INFO.size, INFO.state);

            INFO.size[0] = action.value[0];
            INFO.size[1] = action.value[1];
        } break;

        case "post-state": {
            console.log("posting state", action.value, INFO.state);

            INFO.lastState = INFO.state;
            INFO.state = action.value;
        } break;

        default: unreachable("Invalid WindowInfo Action", action);
    }
}
