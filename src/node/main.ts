import { app, BrowserWindow, Menu, globalShortcut } from "electron";
import * as remoteMain from "@electron/remote/main";

import path from "path";
import { watch } from "fs/promises";


const clientDir = path.join(__dirname, "./client");

(app as any).console = new console.Console(process.stdout, process.stderr);

Menu.setApplicationMenu(null);

remoteMain.initialize();

// if(process.platform === "linux") { // hack to get around transparency glitch on linux, no longer necessary on debian
//     app.commandLine.appendSwitch("enable-transparent-visuals");
//     app.disableHardwareAcceleration();
// }

await app.whenReady();

// await sleep(500); // hack to get around transparency glitch on linux, no longer necessary on debian


const win = new BrowserWindow({
    width: 800,
    height: 600,
    useContentSize: true,
    show: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    },
    frame: false,
    transparent: true,
});

// hack to get around weird behavior with the close/onbeforeunload events
type OnCloseCallback = ((exit: () => void) => void) | null;

const hooks: {onClose: OnCloseCallback} = {
    onClose: null
};

(app as any).hooks = hooks;

let forceClose = false;

win.on("close", async (e) => {
    const callback = hooks.onClose;

    if (!forceClose && callback) {
        e.preventDefault();

        callback(() => {
            hooks.onClose = null;
            win.close();
        });
    }
});

win.on("ready-to-show", () => win.show());

win.loadFile(path.join(clientDir, "index.html"));
// win.setMinimumSize(600, 400);
win.webContents.session.setSpellCheckerEnabled(false);
// win.setFullScreen(true);
// win.webContents.openDevTools();

globalShortcut.register("CommandOrControl+Shift+I", () => {
    if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
    } else {
        win.webContents.openDevTools({
            mode: "detach",
            title: "Vox DevTools",
            activate: true,
        });
    }
});

remoteMain.enable(win.webContents);

let dirty = false;
let needHardReset = false;

(async () => {
    const watcher = watch(clientDir);
    for await (const _ of watcher) {
        dirty = true;
    }
})();

(async () => {
    const watcher = watch(path.join(__dirname, "main.js"));
    for await (const _ of watcher) {
        needHardReset = true;
    }
})();


setInterval(() => {
    if (needHardReset) {
        console.info("need hard reset, reloading electron");
        forceClose = true;
        app.relaunch();
        app.quit();
    }

    if (dirty) {
        console.info("need soft reset, reloading window");
        dirty = false;
        win.reload();
    }
}, 1000);
