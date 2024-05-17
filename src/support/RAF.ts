export type RAF<T> = {
    state: T,
    onStep: (state: T) => void,
    onStop: (state: T) => void,
};

type RAFData = {
    stop: boolean,
    handle: number,
};

type RAFEntry<T> = RAF<T> & RAFData;


let RAF_ID = 0;
const RAF_STORE = {} as Partial<Record<number, RAFEntry<unknown>>> ;

export default function RAF<T> (raf: RAF<T>): [(update: (state: T) => void) => void, () => void] {
    const id = RAF_ID++;

    RAF_STORE[id] = {
        ...raf,
        stop: false,
        handle: requestAnimationFrame(function runRaf () {
            const raf = RAF_STORE[id] as RAFEntry<T>;
            raf.onStep(raf.state);
            if (!raf.stop) raf.handle = requestAnimationFrame(runRaf);
        }),
    };

    return [
        update => {
            const raf = RAF_STORE[id] as RAFEntry<T>;
            update(raf.state);
        },

        () => {
            const raf = RAF_STORE[id] as RAFEntry<T>;
            raf.stop = true;
            cancelAnimationFrame(raf.handle);
            setTimeout(() => {
                console.log("RAF onStop");
                raf.onStop(raf.state);
                delete RAF_STORE[id];
            });
        },
    ];
}
