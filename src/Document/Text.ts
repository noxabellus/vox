import RangeOf from "Support/RangeOf";
import CSS from "Support/CSS";
import { HexRgba } from "Support/color";

export * as Text from "./Text";


export type Text
    = UnformattedText
    & Partial<TextMarks>
    ;


export type UnformattedText = {
    text: string,
};

export type TextMarks = TextShape & TextColor;

export type TextShape = {
    bold: boolean,
    italic: boolean,
    underline: boolean,
};

export type TextColor = {
    foreground: HexRgba | null,
    background: HexRgba | null,
};


export type TextShapeType = keyof TextShape;
export const TextShapeTypes = RangeOf<TextShapeType>()("bold", "italic", "underline");

export type TextColorType = keyof TextColor;
export const TextColorTypes = RangeOf<TextColorType>()("foreground", "background");



export function isText (text: any): text is Text {
    return typeof text.text === "string";
}

export function asText (text: any): Text | undefined {
    if (isText(text)) {
        return text;
    }
}

export function isUnformattedText (text: Text): text is UnformattedText {
    return isText(text)
        && Object.keys(text).length === 1
        ;;
}

export function asUnformattedText (text: Text): UnformattedText | undefined {
    if (isUnformattedText(text)) {
        return text;
    }
}

export function isFormattedText (text: Text): boolean {
    return isText(text)
        && Object.keys(text).length > 1
        ;;
}


export function extractTextShape (text: Text, callback: (k: keyof TextShape, v?: TextShape[typeof k]) => void): void {
    TextShapeTypes.forEach(key => {
        callback(key, text[key]);
    });
}

export function applyTextShape (text: Text, css: CSS) {
    extractTextShape(text, (key, value) => {
        if (value !== undefined) textShapers[key](css, value);
    });
}

export const textShapers: {[K in keyof TextShape]: (css: CSS, enabled: boolean) => void} = {
    bold: (css, enabled) => css.fontWeight = enabled? "bold" : "normal",
    italic: (css, enabled) => css.fontStyle = enabled? "italic" : "normal",
    underline: (css, enabled) => css.textDecoration = enabled? "underline" : "none",
};


export function extractTextColor (text: Text, callback: (k: keyof TextColor, v?: TextColor[typeof k]) => void): void {
    TextColorTypes.forEach(key => {
        callback(key, text[key]);
    });
}

export function applyTextColor (text: Text, css: CSS) {
    extractTextColor(text, (key, value) => {
        if (value !== undefined) textColorers[key](css, value);
    });
}

export const textColorers: {[K in keyof TextColor]: (css: CSS, color: HexRgba | null) => void} = {
    foreground: (css, color) => css.color = color? color : "var(--document-text-color)",
    background: (css, color) => css.backgroundColor = color? color : "var(--document-page-color)",
};


export function applyTextFormat (text: Text, css: CSS) {
    applyTextShape(text, css);
    applyTextColor(text, css);
}
