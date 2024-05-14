
import { PathLike } from "fs";
import fs from "fs/promises";

import { dialog } from "./remote";
import Result from "./result";
import { NonNull, unsafeForceVal } from "./nullable";


export interface Filter {
    name: string;
    extensions: string[];
}


export async function readText (path: PathLike): Promise<Result<{text: string}>> {
    try {
        return Result.Success({text: await fs.readFile(path, "utf8")});
    } catch (error) {
        return Result.Error(error.toString());
    }
}

export async function writeText (path: PathLike, text: string): Promise<Result<PathLike>> {
    try {
        await fs.writeFile(path, text);
        return Result.Success(path);
    } catch (error) {
        return Result.Error(error.toString());
    }
}

export async function openWith<T> (filters: Filter[], callback: (filePath: PathLike) => Promise<Result<T>>): Promise<Result<T & {filePath: PathLike}>> {
    let filePath;
    try {
        const fps = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [
                ...filters,
                { name: "All Files", extensions: ["*"] },
            ],
        });

        if (fps.canceled || fps.filePaths.length != 1) {
            return Result.Failure();
        }

        filePath = fps.filePaths[0];
    } catch (error) {
        return Result.Error(error);
    }

    const res = await callback(filePath);
    if (Result.isSuccess(res)) {
        return Result.Success({ filePath, ...res.body });
    } else {
        return res;
    }
}

export async function saveWith<T extends NonNull> (filters: Filter[], callback: (filePath: PathLike) => Promise<Result<T>>): Promise<Result<T>> {
    try {
        const fps = await dialog.showSaveDialog({
            properties: ["showOverwriteConfirmation"],
            filters: [
                ...filters,
                { name: "All Files", extensions: ["*"] },
            ],
        });

        if (fps.canceled) {
            return Result.Failure();
        }

        // safety: fps has a crappy type,
        // but if !canceled then filePath is always a string
        return callback(unsafeForceVal(fps.filePath));
    } catch (error) {
        return Result.Error(error);
    }
}
