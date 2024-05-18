
import { deepCopy } from "Support/deep";
import { arrayFromFunction } from "Support/array";
import { Descendant } from "Document/hierarchy";


export default [
    {
        type: "heading",
        level: 1,
        children: [
            { text: "A heading!", italic: true, underline: true },
        ],
    },
    {
        type: "paragraph",
        children: [
            { text: "A line of text in a " },
            { text: "paragraph", bold: true, foreground: "#FFFFFFFF", background: "#000000FF" },
            { text: "." },
        ],
    },
    ...arrayFromFunction(40, () => deepCopy({ type: "paragraph", children: [{text: ""}] })),
    {
        type: "block-quote",
        children: [
            {
                type: "heading",
                level: 1,
                children: [
                    { text: "A heading!", italic: true, underline: true },
                ],
            },
            {
                type: "paragraph",
                children: [
                    { text: "A line of text in a " },
                    { text: "paragraph", bold: true, foreground: "#FFFFFFFF", background: "#000000FF" },
                    { text: "." },
                ],
            },
        ],
    }
] as Descendant[];
