import * as remote from "./remote";


export type EventListenerId = number & {__eventListenerId: never};

export type EventSystem<T> = {
    addListener(listener: (value: T) => void): EventListenerId,
    removeListener(id: EventListenerId): void
    teardown(): void,
    readonly value: T,
};

export type ReactEventSystem<T> = {
    addListener(listener: () => void): () => void,
    teardown(): void,
    readonly value: T,
};

function simpleCompare (a: any, b: any): boolean {
    return a === b;
}

export type EventSystemImpl<T> = {
    onStep(): T,
    onTeardown?: () => void,
    onCompare?: (a: T, b: T) => boolean,
}

type ListenerTable<T> = {[K in EventListenerId]: (value: T) => void};

export function EventSystem<T> (onSetup: (dispatch: () => void) => EventSystemImpl<T>): EventSystem<T> {
    const listeners: ListenerTable<T> = {};

    let idCounter = 0;


    const {onStep, onTeardown, onCompare} = onSetup(dispatch);
    const compare = onCompare ?? simpleCompare;

    let value = onStep();

    function dispatch () {
        const newValue = onStep();

        if (compare(value, newValue)) return;

        value = newValue;

        for (const listener of Object.values(listeners)) {
            listener(value);
        }
    };

    const teardownId = remote.addBeforeUnload(teardown);

    let destroyed = false;
    function teardown () {
        if (destroyed) return;
        destroyed = true;

        for (const key of Object.keys(listeners)) {
            const id = parseInt(key) as EventListenerId;
            delete listeners[id];
        }

        onTeardown?.();

        remote.removeBeforeUnload(teardownId);
    };

    return {
        addListener (listener: (value: T) => void) {
            const id = idCounter++ as EventListenerId;
            listeners[id] = listener;
            return id;
        },

        removeListener (id: EventListenerId) {
            delete listeners[id];
        },

        teardown,

        get value () { return value; },
    };
}

export function StateEventSystem<T> (initialValue: T, onCompare?: (a: T, b: T) => boolean): EventSystem<T> & { set value (newValue: T) } {
    let value = initialValue;

    const listeners: ListenerTable<T> = {};
    let idCounter = 0;

    const compare = onCompare ?? simpleCompare;

    return {
        addListener (listener) {
            const id = idCounter++ as EventListenerId;
            listeners[id] = listener;
            return id;
        },

        removeListener (id) {
            delete listeners[id];
        },

        teardown () {
            for (const key of Object.keys(listeners)) {
                const id = parseInt(key) as EventListenerId;
                delete listeners[id];
            }
        },

        get value () { return value; },

        set value (newValue) {
            if (compare(value, newValue)) return;

            value = newValue;

            for (const listener of Object.values(listeners)) {
                listener(value);
            }
        }
    };
}

export function AnimEventSystem<T> (onStep: () => T, onCompare?: (a: T, b: T) => boolean): EventSystem<T> {
    let stop = false;

    let handle: number | null = null;

    return EventSystem(
        dispatch => {
            handle = requestAnimationFrame(function loop () {
                if (stop) return;

                dispatch();

                if (!stop) handle = requestAnimationFrame(loop);
            });

            return {
                onStep,
                onCompare,
                onTeardown () {
                    stop = true;
                    if (handle !== null) cancelAnimationFrame(handle);
                },
            };
        }
    );
}

export function ReactEventSystem<T> (system: EventSystem<T>): ReactEventSystem<T> {
    return {
        addListener (listener) {
            const id = system.addListener(listener);
            return () => { system.removeListener(id); };
        },

        teardown: system.teardown,

        get value () { return system.value; },
    };
}
