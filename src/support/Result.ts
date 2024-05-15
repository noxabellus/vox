import { NonNull } from "./nullable";
import RangeOf from "./RangeOf";

export * as Result from "./Result";


export type Result<T, E extends NonNull = string> = Success<T> | Failure | Error<E>;

export type Success<T> = {
    status: "success",
    body: T,
}

export type Failure = {
    status: "failure",
}

export type Error<E> = {
    status: "error",
    body: E,
}


export type Status = Result<unknown, NonNull>["status"];
export const Statuses = RangeOf<Status>()("success", "failure", "error");


export function Success<T>(body: T): Success<T> {
    return { status: "success", body };
}

export function Failure(): Failure {
    return { status: "failure" };
}

export function Error<E extends NonNull>(body: E): Error<E> {
    return { status: "error", body };
}

export function isResult<T, E extends NonNull>(res: Result<T, E>): res is Result<T, E> {
    return Statuses.includes(res.status);
}

export function isSuccess<T, E extends NonNull>(res: Result<T, E>): res is Success<T> {
    return res.status === "success";
}

export function notSuccess<T, E extends NonNull>(res: Result<T, E>): res is Failure | Error<E> {
    return res.status !== "success";
}

export function isFailure<T, E extends NonNull>(res: Result<T, E>): res is Failure {
    return res.status === "failure";
}

export function isError<T, E extends NonNull>(res: Result<T, E>): res is Error<E> {
    return res.status === "error";
}

export function problemMessage<T, E extends NonNull>(res: Result<T, E>): string {
    if (Result.isFailure(res)) {
        return "unknown failure";
    } else if (Result.isError(res)) {
        return res.body.toString();
    } else {
        return "not a failure";
    }
}
