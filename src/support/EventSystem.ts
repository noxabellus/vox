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

export function EventSystem<T> (onSetup: (dispatch: () => void) => (() => void), onStep: () => T, compare: (a: T, b: T) => boolean = simpleCompare): EventSystem<T> {
    const listeners: {[K in EventListenerId]: (value: T) => void}= [];

    let idCounter = 0;

    let value = onStep();

    const dispatch = () => {
        const newValue = onStep();

        if (compare(value, newValue)) return;

        value = newValue;

        for (const listener of Object.values(listeners)) {
            listener(value);
        }
    };

    const onTeardown = onSetup(dispatch);

    const teardownId = remote.addBeforeUnload(teardown);

    let destroyed = false;
    function teardown () {
        if (destroyed) return;
        destroyed = true;

        for (const key of Object.keys(listeners)) {
            const id = parseInt(key) as EventListenerId;
            delete listeners[id];
        }

        onTeardown();

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

export function AnimEventSystem<T> (onStep: () => T, compare: (a: T, b: T) => boolean = simpleCompare): EventSystem<T> {
    let stop = false;

    let handle: number | null = null;

    return EventSystem(
        dispatch => {
            handle = requestAnimationFrame(function loop () {
                if (stop) return;

                dispatch();

                if (!stop) handle = requestAnimationFrame(loop);
            });

            return () => {
                stop = true;
                if (handle !== null) cancelAnimationFrame(handle);
            };
        },
        onStep,
        compare
    );
}
