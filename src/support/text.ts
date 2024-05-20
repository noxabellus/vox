
export function stringWords (s: string): number {
    if (s.length != 0 && s.match(/\b[-?(\w+)?]+\b/gi)) {
        s = s.replace(/(^\s*)|(\s*$)/gi, "");
        s = s.replace(/[ ]{2,}/gi, " ");
        s = s.replace(/\n /, "\n");
        return s.split(" ").length;
    }

    return 0;
}
