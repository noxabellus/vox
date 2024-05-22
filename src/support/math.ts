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


export function v2sub (a: Vec2, b: Vec2): Vec2 {
    return [a[0] - b[0], a[1] - b[1]];
}

export function v2add (a: Vec2, b: Vec2): Vec2 {
    return [a[0] + b[0], a[1] + b[1]];
}

export function v2mul (a: Vec2, b: Vec2): Vec2 {
    return [a[0] * b[0], a[1] * b[1]];
}

export function v2div (a: Vec2, b: Vec2): Vec2 {
    return [a[0] / b[0], a[1] / b[1]];
}

export function sV2sub (a: number, b: Vec2): Vec2 {
    return [a - b[0], a - b[1]];
}

export function sV2add (a: number, b: Vec2): Vec2 {
    return [a + b[0], a + b[1]];
}

export function sV2mul (a: number, b: Vec2): Vec2 {
    return [a * b[0], a * b[1]];
}

export function sV2div (a: number, b: Vec2): Vec2 {
    return [a / b[0], a / b[1]];
}

export function v2subS (a: Vec2, b: number): Vec2 {
    return [a[0] - b, a[1] - b];
}

export function v2addS (a: Vec2, b: number): Vec2 {
    return [a[0] + b, a[1] + b];
}

export function v2mulS (a: Vec2, b: number): Vec2 {
    return [a[0] * b, a[1] * b];
}

export function v2divS (a: Vec2, b: number): Vec2 {
    return [a[0] / b, a[1] / b];
}

export function v2subM (a: Vec2, b: Vec2, which = a): Vec2 {
    which[0] = a[0] - b[0];
    which[1] = a[1] - b[1];
    return which;
}

export function v2addM (a: Vec2, b: Vec2, which = a): Vec2 {
    which[0] = a[0] + b[0];
    which[1] = a[1] + b[1];
    return which;
}

export function v2mulM (a: Vec2, b: Vec2, which = a): Vec2 {
    which[0] = a[0] * b[0];
    which[1] = a[1] * b[1];
    return which;
}

export function v2divM (a: Vec2, b: Vec2, which = a): Vec2 {
    which[0] = a[0] / b[0];
    which[1] = a[1] / b[1];
    return which;
}

export function sV2subM (a: number, b: Vec2): Vec2 {
    b[0] = a - b[0];
    b[1] = a - b[1];
    return b;
}

export function sV2addM (a: number, b: Vec2): Vec2 {
    b[0] = a + b[0];
    b[1] = a + b[1];
    return b;
}

export function sV2mulM (a: number, b: Vec2): Vec2 {
    b[0] = a * b[0];
    b[1] = a * b[1];
    return b;
}

export function sV2divM (a: number, b: Vec2): Vec2 {
    b[0] = a / b[0];
    b[1] = a / b[1];
    return b;
}

export function v2subSM (a: Vec2, b: number): Vec2 {
    a[0] -= b;
    a[1] -= b;
    return a;
}

export function v2addSM (a: Vec2, b: number): Vec2 {
    a[0] += b;
    a[1] += b;
    return a;
}

export function v2mulSM (a: Vec2, b: number): Vec2 {
    a[0] *= b;
    a[1] *= b;
    return a;
}

export function v2divSM (a: Vec2, b: number): Vec2 {
    a[0] /= b;
    a[1] /= b;
    return a;
}

export function v3sub (a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function v3add (a: Vec3, b: Vec3): Vec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function v3mul (a: Vec3, b: Vec3): Vec3 {
    return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}

export function v3div (a: Vec3, b: Vec3): Vec3 {
    return [a[0] / b[0], a[1] / b[1], a[2] / b[2]];
}

export function sV3sub (a: number, b: Vec3): Vec3 {
    return [a - b[0], a - b[1], a - b[2]];
}

export function sV3add (a: number, b: Vec3): Vec3 {
    return [a + b[0], a + b[1], a + b[2]];
}

export function sV3mul (a: number, b: Vec3): Vec3 {
    return [a * b[0], a * b[1], a * b[2]];
}

export function sV3div (a: number, b: Vec3): Vec3 {
    return [a / b[0], a / b[1], a / b[2]];
}

export function v3subS (a: Vec3, b: number): Vec3 {
    return [a[0] - b, a[1] - b, a[2] - b];
}

export function v3addS (a: Vec3, b: number): Vec3 {
    return [a[0] + b, a[1] + b, a[2] + b];
}

export function v3mulS (a: Vec3, b: number): Vec3 {
    return [a[0] * b, a[1] * b, a[2] * b];
}

export function v3divS (a: Vec3, b: number): Vec3 {
    return [a[0] / b, a[1] / b, a[2] / b];
}

export function v3subM (a: Vec3, b: Vec3, which = a): Vec3 {
    which[0] = a[0] - b[0];
    which[1] = a[1] - b[1];
    which[2] = a[2] - b[2];
    return which;
}

export function v3addM (a: Vec3, b: Vec3, which = a): Vec3 {
    which[0] = a[0] + b[0];
    which[1] = a[1] + b[1];
    which[2] = a[2] + b[2];
    return which;
}

export function v3mulM (a: Vec3, b: Vec3, which = a): Vec3 {
    which[0] = a[0] * b[0];
    which[1] = a[1] * b[1];
    which[2] = a[2] * b[2];
    return which;
}

export function v3divM (a: Vec3, b: Vec3, which = a): Vec3 {
    which[0] = a[0] / b[0];
    which[1] = a[1] / b[1];
    which[2] = a[2] / b[2];
    return which;
}

export function sV3subM (a: number, b: Vec3): Vec3 {
    b[0] = a - b[0];
    b[1] = a - b[1];
    b[2] = a - b[2];
    return b;
}

export function sV3addM (a: number, b: Vec3): Vec3 {
    b[0] = a + b[0];
    b[1] = a + b[1];
    b[2] = a + b[2];
    return b;
}

export function sV3mulM (a: number, b: Vec3): Vec3 {
    b[0] = a * b[0];
    b[1] = a * b[1];
    b[2] = a * b[2];
    return b;
}

export function sV3divM (a: number, b: Vec3): Vec3 {
    b[0] = a / b[0];
    b[1] = a / b[1];
    b[2] = a / b[2];
    return b;
}

export function v3subSM (a: Vec3, b: number): Vec3 {
    a[0] -= b;
    a[1] -= b;
    a[2] -= b;
    return a;
}

export function v3addSM (a: Vec3, b: number): Vec3 {
    a[0] += b;
    a[1] += b;
    a[2] += b;
    return a;
}

export function v3mulSM (a: Vec3, b: number): Vec3 {
    a[0] *= b;
    a[1] *= b;
    a[2] *= b;
    return a;
}

export function v3divSM (a: Vec3, b: number): Vec3 {
    a[0] /= b;
    a[1] /= b;
    a[2] /= b;
    return a;
}

export function v4sub (a: Vec4, b: Vec4): Vec4 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
}

export function v4add (a: Vec4, b: Vec4): Vec4 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
}

export function v4mul (a: Vec4, b: Vec4): Vec4 {
    return [a[0] * b[0], a[1] * b[1], a[2] * b[2], a[3] * b[3]];
}

export function v4div (a: Vec4, b: Vec4): Vec4 {
    return [a[0] / b[0], a[1] / b[1], a[2] / b[2], a[3] / b[3]];
}

export function sV4sub (a: number, b: Vec4): Vec4 {
    return [a - b[0], a - b[1], a - b[2], a - b[3]];
}

export function sV4add (a: number, b: Vec4): Vec4 {
    return [a + b[0], a + b[1], a + b[2], a + b[3]];
}

export function sV4mul (a: number, b: Vec4): Vec4 {
    return [a * b[0], a * b[1], a * b[2], a * b[3]];
}

export function sV4div (a: number, b: Vec4): Vec4 {
    return [a / b[0], a / b[1], a / b[2], a / b[3]];
}

export function v4subS (a: Vec4, b: number): Vec4 {
    return [a[0] - b, a[1] - b, a[2] - b, a[3] - b];
}

export function v4addS (a: Vec4, b: number): Vec4 {
    return [a[0] + b, a[1] + b, a[2] + b, a[3] + b];
}

export function v4mulS (a: Vec4, b: number): Vec4 {
    return [a[0] * b, a[1] * b, a[2] * b, a[3] * b];
}

export function v4divS (a: Vec4, b: number): Vec4 {
    return [a[0] / b, a[1] / b, a[2] / b, a[3] / b];
}

export function v4subM (a: Vec4, b: Vec4, which = a): Vec4 {
    which[0] = a[0] - b[0];
    which[1] = a[1] - b[1];
    which[2] = a[2] - b[2];
    which[3] = a[3] - b[3];
    return which;
}

export function v4addM (a: Vec4, b: Vec4, which = a): Vec4 {
    which[0] = a[0] + b[0];
    which[1] = a[1] + b[1];
    which[2] = a[2] + b[2];
    which[3] = a[3] + b[3];
    return which;
}

export function v4mulM (a: Vec4, b: Vec4, which = a): Vec4 {
    which[0] = a[0] * b[0];
    which[1] = a[1] * b[1];
    which[2] = a[2] * b[2];
    which[3] = a[3] * b[3];
    return which;
}

export function v4divM (a: Vec4, b: Vec4, which = a): Vec4 {
    which[0] = a[0] / b[0];
    which[1] = a[1] / b[1];
    which[2] = a[2] / b[2];
    which[3] = a[3] / b[3];
    return which;
}

export function sV4subM (a: number, b: Vec4): Vec4 {
    b[0] = a - b[0];
    b[1] = a - b[1];
    b[2] = a - b[2];
    b[3] = a - b[3];
    return b;
}

export function sV4addM (a: number, b: Vec4): Vec4 {
    b[0] = a + b[0];
    b[1] = a + b[1];
    b[2] = a + b[2];
    b[3] = a + b[3];
    return b;
}

export function sV4mulM (a: number, b: Vec4): Vec4 {
    b[0] = a * b[0];
    b[1] = a * b[1];
    b[2] = a * b[2];
    b[3] = a * b[3];
    return b;
}

export function sV4divM (a: number, b: Vec4): Vec4 {
    b[0] = a / b[0];
    b[1] = a / b[1];
    b[2] = a / b[2];
    b[3] = a / b[3];
    return b;
}

export function v4subSM (a: Vec4, b: number): Vec4 {
    a[0] -= b;
    a[1] -= b;
    a[2] -= b;
    a[3] -= b;
    return a;
}

export function v4addSM (a: Vec4, b: number): Vec4 {
    a[0] += b;
    a[1] += b;
    a[2] += b;
    a[3] += b;
    return a;
}

export function v4mulSM (a: Vec4, b: number): Vec4 {
    a[0] *= b;
    a[1] *= b;
    a[2] *= b;
    a[3] *= b;
    return a;
}

export function v4divSM (a: Vec4, b: number): Vec4 {
    a[0] /= b;
    a[1] /= b;
    a[2] /= b;
    a[3] /= b;
    return a;
}

export function v2comp (a?: Vec2, b?: Vec2, eps = Number.EPSILON): boolean {
    if (a === b) return true;
    if (!a || !b) return false;

    return Math.abs(a[0] - b[0]) <= eps || Math.abs(a[1] - b[1]) <= eps;
}

export function v3comp (a?: Vec3, b?: Vec3, eps = Number.EPSILON): boolean {
    if (a === b) return true;
    if (!a || !b) return false;

    return Math.abs(a[0] - b[0]) <= eps || Math.abs(a[1] - b[1]) <= eps || Math.abs(a[2] - b[2]) <= eps;
}

export function v4comp (a?: Vec4, b?: Vec4, eps = Number.EPSILON): boolean {
    if (a === b) return true;
    if (!a || !b) return false;

    return Math.abs(a[0] - b[0]) <= eps || Math.abs(a[1] - b[1]) <= eps || Math.abs(a[2] - b[2]) <= eps || Math.abs(a[3] - b[3]) <= eps;
}


export function clamp (value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
