
import * as remote from "@electron/remote";


export type OnCloseCallback = ((exit: () => void) => void) | null;


export const terminal: Console = (remote.app as any).console;

export const hooks: {onClose: OnCloseCallback} = (remote.app as any).hooks;

export * from "@electron/remote";


terminal.log("remote connected");
