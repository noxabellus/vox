export * as Text from "./Text";


export type Text
    = UnformattedText
    | FormattedText
    ;

export type UnformattedText = { text: string };

export type FormattedText = UnformattedText & {
    decoration: Partial<TextDecoration>,
};

export type TextDecoration = {
    bold: true,
    italic: true,
    underline: true,
};



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

export function isFormattedText (text: Text): text is FormattedText {
    return isText(text)
        && (text as FormattedText).decoration !== undefined;
}

export function asFormattedText (text: Text): FormattedText | undefined {
    if (isFormattedText(text)) {
        return text;
    }
}

export const textDecorators: {[K in keyof TextDecoration]: (css: any) => void} = {
    bold: css => css.fontWeight = "bold",
    italic: css => css.fontStyle = "italic",
    underline: css => css.textDecoration = "underline",
};
