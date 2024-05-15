import TypesEqual from "./TypesEqual";

export default function rangeOf<U>() {
    return function <T extends U[]>(...values: T) {
      type Result = true extends TypesEqual<U, typeof values[number]> ? T : undefined;
      return values as Result;
    };
  }
