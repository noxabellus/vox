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
};


export type Action
    = SetSize
    | SetMinimumSize
    | SetState
    | SetResizable
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

export type ActionType = Action["type"];
export const ActionTypes = RangeOf<ActionType>()("set-size", "set-minimum-size", "set-state", "set-resizable");

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
        case "maximized": {
            if (!remote.window.isMaximized()) remote.window.maximize();
        } break;

        case "minimized": {
            if (!remote.window.isMinimized()) remote.window.minimize();
        } break;

        case "fullscreen": {
            if (!remote.window.isFullScreen()) remote.window.setFullScreen(true);
        } break;

        case "normal": {
            if (remote.window.isMaximized()) remote.window.unmaximize();
            if (remote.window.isMinimized()) remote.window.restore();
            if (remote.window.isFullScreen()) remote.window.setFullScreen(false);
        } break;
    }
}


const Ctx = createContext<WindowInfo>(undefined as any);
export const Provider = Ctx.Provider;


export function useStore (): WindowInfo {
    return {
        size: [
            useSyncExternalStore(...subscriber("resize", () => remote.window.getSize()[0])),
            useSyncExternalStore(...subscriber("resize", () => remote.window.getSize()[1]))
        ],
        minimumSize: [
            useSyncExternalStore(...subscriber("minimum-size", () => remote.window.getMinimumSize()[0])),
            useSyncExternalStore(...subscriber("minimum-size", () => remote.window.getMinimumSize()[1]))
        ],
        resizable: useSyncExternalStore(...subscriber("resizable", () => remote.window.isResizable())),
        state: useSyncExternalStore(...subscriber("state-change", getWindowState)),
    };
}


export function useWindow(): [WindowInfo, (action: Action) => void, (action: Action) => void] {
    return [
        useContext(Ctx),
        dispatch,
        (action: Action) => useMemo(() => { dispatch(action); }, []),
    ];
}


function subscriber<T> (eventName: "resize" | "minimum-size" | "resizable" | "state-change", getter: () => T): [(listener: () => void) => () => void, () => T] {
    switch (eventName) {
        case "resize":
            return [(listener: (() => void) | null) => {
                const handler = () => { listener?.(); };

                remote.window.on("resize" as any, handler);

                const teardown = () => {
                    if (listener !== null) {
                        listener = null;

                        remote.window.off(eventName as any, handler);
                        remote.removeBeforeUnload(teardown);
                    }
                };

                remote.addBeforeUnload(teardown);

                return teardown;
            }, getter];

        case "resizable":
        case "minimum-size": {
            let LISTENER:  (() => void) | null = null;

            let stop = false;
            let last = getter();

            let handle = requestAnimationFrame(function loop () {
                if (stop) return;

                const current = getter();
                if (current !== last) {
                    last = current;
                    LISTENER?.();
                }

                if (!stop) handle = requestAnimationFrame(loop);
            });

            const teardown = () => {
                if (LISTENER !== null) {
                    LISTENER = null;

                    stop = true;
                    cancelAnimationFrame(handle);

                    remote.removeBeforeUnload(teardown);
                }
            };

            remote.addBeforeUnload(teardown);

            return [listener => {
                assert(LISTENER === null);

                LISTENER = listener;

                return teardown;
            }, () => last];
        }

        case "state-change": {
            const edges = ["maximize", "unmaximize", "minimize", "restore", "enter-full-screen", "leave-full-screen"] as const;

            let LISTENER: (() => void) | null = null;

            const handler = () => { LISTENER?.(); };

            for (const edge of edges) {
                remote.window.on(edge as any, handler);
            }

            const teardown = () => {
                if (LISTENER !== null) {
                    LISTENER = null;

                    for (const edge of edges) {
                        remote.window.off(edge as any, handler);
                    }

                    remote.removeBeforeUnload(teardown);
                }
            };

            remote.addBeforeUnload(teardown);

            return [listener => {
                assert(LISTENER === null);

                LISTENER = listener;

                return teardown;
            }, getter];
        }
    }
}


function dispatch (action: Action) {
    switch (action.type) {
        case "set-size": {
            const minimumSize = remote.window.getMinimumSize();

            if (minimumSize[0] > action.value[0] || minimumSize[1] > action.value[1]) {
                remote.window.setMinimumSize(...action.value);
            }

            remote.window.setSize(...action.value, false);
        } break;

        case "set-minimum-size": {
            const size = remote.window.getSize();

            if (size[0] < action.value[0] || size[1] < action.value[1]) {
                remote.window.setSize(...action.value, false);
            }

            remote.window.setMinimumSize(...action.value);
        } break;

        case "set-state": {
            setWindowState(action.value);
        } break;

        case "set-resizable": {
            remote.window.setResizable(action.value);
        } break;

        default: unreachable("Invalid WindowInfo Action", action);
    }
}
