import RangeOf from "Support/RangeOf";
import CSS from "Support/CSS";

export * as Text from "./Text";


export type Text
    = UnformattedText
    & Partial<TextDecoration>
    ;

export type UnformattedText = {
    text: string,
};

export type TextDecoration = {
    bold: boolean,
    italic: boolean,
    underline: boolean,
};

export type TextDecorationType = keyof TextDecoration;
export const TextDecorationTypes = RangeOf<TextDecorationType>()("bold", "italic", "underline");



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

export function extractTextFormat (text: Text, callback: (k: keyof TextDecoration, v?: TextDecoration[typeof k]) => void): void {
    TextDecorationTypes.forEach(key => {
        callback(key, text[key]);
    });
}

export function applyTextFormat (text: Text, css: CSS) {
    extractTextFormat(text, (key, value) => {
        if (value) {
            textDecorators[key](css, value);
        }
    });
}

function triSwitch (propName: keyof CSS, ifEnabled: CSS[typeof propName], ifDisabled: CSS[typeof propName]) {
    return (css: CSS, enabled?: boolean): void => {
        switch (enabled) {
            // @ts-expect-error type is too complex
            case true: css[propName] = ifEnabled; break;
            case false: css[propName] = ifDisabled; break;
        }
    };
}

export const textDecorators: {[K in keyof TextDecoration]: (css: CSS, enabled?: boolean) => void} = {
    bold: triSwitch("fontWeight", "bold", "normal"),
    italic: triSwitch("fontStyle", "italic", "normal"),
    underline: triSwitch("textDecoration", "underline", "none"),
};
