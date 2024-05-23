
import * as remote from "@electron/remote";


export type OnCloseCallback = ((exit: () => void) => void) | null;

export type OnReloadCallback = ((reload: () => void) => void) | null;

export const terminal: Console = (remote.app as any).console;

export const hooks: {onClose: OnCloseCallback, onReload: OnReloadCallback} = (remote.app as any).hooks;

export const window = remote.getCurrentWindow();


let listeners: (() => void)[] = [];

export function addBeforeUnload(listener: () => void) {
    listeners.push(listener);
}

export function removeBeforeUnload(listener: () => void) {
    listeners = listeners.filter(l => l !== listener);
}

hooks.onReload = reload => {
    for (const listener of listeners) listener();
    reload();
};


export function setWindowSize (width: number, height: number, maximizable: boolean = true, resizable: boolean = true) {
    let isMaximized = window.isMaximized();

    if (!maximizable && isMaximized) {
        window.unmaximize();
        isMaximized = false;
    };

    window.setMaximizable(maximizable);

    const [currentX, currentY] = window.getPosition();
    const [currentWidth, currentHeight] = window.getSize();

    // have to set it here to be able to use setSize < any existing min
    window.setMinimumSize(width, height);

    let resized = false;
    if (!isMaximized && (!resizable || currentWidth < width || currentHeight < height)) {
        window.setSize(width, height, false);
        resized = true;
    }

    window.setResizable(resizable);

    // have to set it here because setResizable clears it
    window.setMinimumSize(width, height);

    if (resized) {
        // ensure window stays centered on its previous position
        window.setPosition((currentX + currentWidth / 2) - width / 2, (currentY + currentHeight / 2) - height / 2);
    }
}


export * from "@electron/remote";


terminal.log("remote connected");
