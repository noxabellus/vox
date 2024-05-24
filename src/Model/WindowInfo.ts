import * as remote from "Support/remote";
import RangeOf from "Support/RangeOf";
import { Vec2, v2comp } from "Support/math";
import { unreachable } from "Support/panic";
import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { AnimEventSystem, EventSystem, ReactEventSystem } from "Support/EventSystem";

export * as WindowInfo from "./WindowInfo";


export type WindowInfo = {
    size: Vec2,
    minimumSize: Vec2,
    resizable: boolean,
    state: State,
    readonly lastState: State,
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

export type WindowStateEdge = typeof WindowStateEdges[number];
export const WindowStateEdges = ["maximize", "unmaximize", "minimize", "restore", "enter-full-screen", "leave-full-screen"] as const;


async function doWindowStateChange (stateEdge: WindowStateEdge | null): Promise<void> {
    return new Promise((resolve, reject) => {
        let resolved = false;
        const resolver = () => {
            resolved = true;
            resolve();
        };

        setTimeout(() => {
            if (!resolved) reject(`unresolved windowStateChange ${stateEdge}`);
        }, 500);

        switch (stateEdge) {
            case null:
                return (
                    doWindowStateChange("unmaximize")
                        .then(() => doWindowStateChange("restore"))
                        .then(() => doWindowStateChange("leave-full-screen"))
                        .then(resolve)
                );


            case "maximize":
                if (remote.window.isMaximized()) return resolver();
                else {
                    remote.window.once(stateEdge, resolver);
                    remote.window.maximize();
                    return;
                }

            case "unmaximize":
                if (!remote.window.isMaximized()) return resolver();
                else {
                    remote.window.once(stateEdge, resolver);
                    remote.window.unmaximize();
                    return;
                }

            case "minimize":
                if (remote.window.isMinimized()) return resolver();
                else {
                    remote.window.once(stateEdge, resolver);
                    remote.window.minimize();
                    return;
                }

            case "restore":
                if (!remote.window.isMinimized()) return resolver();
                else {
                    remote.window.once(stateEdge, resolver);
                    remote.window.restore();
                    return;
                }

            case "enter-full-screen":
                if (remote.window.isFullScreen()) return resolver();
                else {
                    remote.window.once(stateEdge, resolver);
                    remote.window.setFullScreen(true);
                    return;
                }

            case "leave-full-screen":
                if (!remote.window.isFullScreen()) return resolver();
                else {
                    remote.window.once(stateEdge, resolver);
                    remote.window.setFullScreen(false);
                    return;
                }

            default: reject(`invalid WindowStateEdge ${stateEdge}`);
        }
    });
}

export function isState (value: any): value is State {
    return States.includes(value);
}

function getWindowState (): State {
    return remote.window.isMaximized() ? "maximized" : remote.window.isMinimized() ? "minimized" : remote.window.isFullScreen() ? "fullscreen" : "normal";
}

async function setWindowState (state: State) {
    switch (state) {
        case "maximized":
            return doWindowStateChange("maximize");

        case "minimized":
            return doWindowStateChange("minimize");

        case "fullscreen":
            return doWindowStateChange("enter-full-screen");

        case "normal":
            return doWindowStateChange(null);
    }
}


const Ctx = createContext<WindowInfo>(undefined as any);
export const Provider = Ctx.Provider;


const ResizeEvent = EventSystem<Vec2>(
    dispatch => {
        const filter = () => {
            if (StateEvent.value !== "normal") return;
            dispatch();
        };
        remote.window.on("resize", filter);
        return () => remote.window.off("resize", filter);
    },
    () => remote.window.getSize() as Vec2,
    v2comp
);

const MinimumSizeEvent = AnimEventSystem<Vec2>(() => remote.window.getMinimumSize() as Vec2, v2comp);

const ResizableEvent = AnimEventSystem<boolean>(() => remote.window.isResizable());

const StateEvent = EventSystem<State>(
    dispatch => {

        for (const edge of WindowStateEdges) {
            remote.window.on(edge as any, dispatch);
        }

        return () => {
            for (const edge of WindowStateEdges) {
                remote.window.off(edge as any, dispatch);
            }
        };
    },
    getWindowState,
);

let LAST_STATE: State = getWindowState();

const LastStateEvent = EventSystem<State>(
    dispatch => {
        let SECOND_STATE = LAST_STATE;

        const id = StateEvent.addListener(newValue => {
            LAST_STATE = SECOND_STATE;
            SECOND_STATE = newValue;
            dispatch();
        });

        return () => StateEvent.removeListener(id);
    },
    () => LAST_STATE
);

const ResizeEventReact = ReactEventSystem(ResizeEvent);
const MinimumSizeEventReact = ReactEventSystem(MinimumSizeEvent);
const ResizableEventReact = ReactEventSystem(ResizableEvent);
const StateEventReact = ReactEventSystem(StateEvent);

export function useStore (): WindowInfo {
    return {
        size: [
            useSyncExternalStore(ResizeEventReact.addListener, () => ResizeEventReact.value[0]),
            useSyncExternalStore(ResizeEventReact.addListener, () => ResizeEventReact.value[1]),
        ],
        minimumSize: [
            useSyncExternalStore(MinimumSizeEventReact.addListener, () => MinimumSizeEventReact.value[0]),
            useSyncExternalStore(MinimumSizeEventReact.addListener, () => MinimumSizeEventReact.value[1]),
        ],
        resizable: useSyncExternalStore(ResizableEventReact.addListener, () => ResizableEventReact.value),
        state: useSyncExternalStore(StateEventReact.addListener, () => StateEventReact.value),
        get lastState () { return LastStateEvent.value; }
    };
}


export function useWindow(): [WindowInfo, (action: Action) => void, (action: Action) => void] {
    return [
        useContext(Ctx),
        dispatch,
        (action: Action) => useMemo(() => { dispatch(action); }, []),
    ];
}


const DISPATCH_QUEUE: (() => Promise<void>)[] = [];

function enqueue (executor: () => Promise<void>) {
    DISPATCH_QUEUE.push(executor);
}

function dispatch (action: Action) {
    switch (action.type) {
        case "set-size": enqueue(async () => {
            const minimumSize = remote.window.getMinimumSize();

            if (minimumSize[0] > action.value[0] || minimumSize[1] > action.value[1]) {
                remote.window.setMinimumSize(...action.value);
            }

            remote.window.setSize(...action.value, false);
        }); break;

        case "set-minimum-size": enqueue(async () => {
            const size = remote.window.getSize();

            if (size[0] < action.value[0] || size[1] < action.value[1]) {
                remote.window.setSize(...action.value, false);
            }

            remote.window.setMinimumSize(...action.value);
        }); break;

        case "set-state": enqueue(async () => {
            await setWindowState(action.value);
        }); break;

        case "set-resizable": enqueue(async () => {
            remote.window.setResizable(action.value);
        }); break;

        default: unreachable("Invalid WindowInfo Action", action);
    }
}

{
    let stop = false;

    let handle = requestAnimationFrame(async function dequeue () {
        if (stop) return;

        const action = DISPATCH_QUEUE.shift();

        if (action) await action();

        if (!stop) handle = requestAnimationFrame(dequeue);
    });

    remote.addBeforeUnload(() => {
        stop = true;
        cancelAnimationFrame(handle);
    });
}
