import { Text } from "./Text";


export * as Element from "./Element";


export type Element
    = ParagraphElement
    | HeadingElement
    | BlockQuoteElement
    ;

export type ParagraphElement = {
    type: "paragraph",
    children: Text[],
};

export type HeadingElement = {
    type: "heading",
    level: HeadingLevel,
    children: Text[],
};

export type BlockQuoteElement = {
    type: "block-quote",
    children: Element[],
};

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type ElementType = Element["type"];


export function isElementType (type: string): type is ElementType {
    return ["paragraph", "heading", "block-quote"].includes(type);
}

export function isElement (element: any): element is Element {
    return isElementType(element.type)
        && Array.isArray(element.children);
}

export function isSpecificElement (element: any, type: ElementType): element is Element {
    return element.type === type
        && Array.isArray(element.children);
}

export function asElement (element: any): Element | undefined {
    if (isElement(element)) {
        return element;
    }
}

export function isParagraphElement (element: Element): element is ParagraphElement {
    return isSpecificElement(element, "paragraph");
}

export function asParagraphElement (element: Element): ParagraphElement | undefined {
    if (isParagraphElement(element)) {
        return element;
    }
}

export function isHeadingElement (element: Element): element is HeadingElement {
    return isSpecificElement(element, "heading");
}

export function asHeadingElement (element: Element): HeadingElement | undefined {
    if (isHeadingElement(element)) {
        return element;
    }
}

export function isBlockQuoteElement (element: Element): element is BlockQuoteElement {
    return isSpecificElement(element, "block-quote");
}

export function asBlockQuoteElement (element: Element): BlockQuoteElement | undefined {
    if (isBlockQuoteElement(element)) {
        return element;
    }
}
