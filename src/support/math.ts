export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];


export function parseFloatSafe (value: string): number {
    const parsed = parseFloat(value);
    return isNaN(parsed)? 0.0 : parsed;
}

export function parseIntSafe (value: string): number {
    const parsed = parseInt(value);
    return isNaN(parsed)? 0 : parsed;
}

export function toFixed (num: number) {
    return Math.round(num * 1e2) / 1e2;
}



export function rectsOverlap (rect: DOMRect, container: DOMRect) {
    return rect.right > container.left
        && rect.left < container.right
        && rect.bottom > container.top
        && rect.top < container.bottom
        ;;
}


export function rangeCompare (a?: Range, b?: Range): boolean {
    if (a === b) return true;

    if (!a || !b) return false;

    return a.compareBoundaryPoints(a.START_TO_START, b) === 0
        && a.compareBoundaryPoints(a.END_TO_END, b) === 0
        ;;
}


export function vec2Compare (a?: Vec2, b?: Vec2): boolean {
    if (a === b) return true;

    if (!a || !b) return false;

    return a[0] === b[0]
        && a[1] === b[1]
        ;;
}

export function vec3Compare (a?: Vec3, b?: Vec3): boolean {
    if (a === b) return true;

    if (!a || !b) return false;

    return a[0] === b[0]
        && a[1] === b[1]
        && a[2] === b[2]
        ;;
}

export function vec4Compare (a?: Vec4, b?: Vec4): boolean {
    if (a === b) return true;

    if (!a || !b) return false;

    return a[0] === b[0]
        && a[1] === b[1]
        && a[2] === b[2]
        && a[3] === b[3]
        ;;
}
