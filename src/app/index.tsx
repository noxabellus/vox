import "Support/remote";

import { styled } from "styled-components";

import { ReactElement, useCallback, useState } from "react";

import { createEditor, BaseEditor, Editor, Descendant } from "slate";

import { Slate, Editable, withReact, ReactEditor, RenderElementProps, RenderLeafProps } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";


type VoxEditor = BaseEditor & ReactEditor & HistoryEditor;

type ParagraphElement = {
  type: "paragraph",
  children: VoxText[],
};

type BlockQuoteElement = {
    type: "block-quote",
    children: VoxElement[],
};

type HeadingElement = {
    type: "heading",
    level: HeadingLevel,
    children: VoxText[],
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type VoxElement = ParagraphElement | HeadingElement | BlockQuoteElement;

type UnformattedText = { text: string };

type FormattedText = UnformattedText & {
    decoration: Partial<TextDecoration>,
};

function isFormattedText (text: VoxText): text is FormattedText {
    return (text as FormattedText).decoration !== undefined;
}

const textDecorators: {[K in keyof TextDecoration]: (css: any) => void} = {
    bold: css => css.fontWeight = "bold",
    italic: css => css.fontStyle = "italic",
    underline: css => css.textDecoration = "underline",
};

type TextDecoration = {
    bold: true,
    italic: true,
    underline: true,
};


type VoxText = UnformattedText | FormattedText

declare module "slate" {
    interface CustomTypes {
        Editor: VoxEditor,
        Element: VoxElement,
        Text: VoxText,
    }
}

const VoxEditor = {
    ...Editor,
    ...ReactEditor,
    ...HistoryEditor,
};



const Body = styled.div`
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    font-family: Roboto;
    background-color: #f0f0f0;
    color: #202020;
    border-radius: 1em;

    & h1 {
        font-size: 2em;
        line-height: 1.25em;
    }

    & blockquote {
        border: 1px solid #202020;
        border-radius: .25em;
        padding: 1em 1em;
    }
`;

function elementRenderer ({element, attributes, children}: RenderElementProps): ReactElement {
    switch (element.type) {
        case "heading": {
            const Lvl = ["h1", "h2", "h3", "h4", "h5", "h6"][element.level - 1];
            return <Lvl {...attributes}>{children}</Lvl>;
        }

        case "block-quote":
            return <blockquote {...attributes}>{children}</blockquote>;

        case "paragraph":
            return <p {...attributes}>{children}</p>;
    }
};

function leafRenderer ({leaf, attributes, children}: RenderLeafProps): ReactElement {
    const style = {};

    if (isFormattedText(leaf)) {
        Object.keys(leaf.decoration).forEach((key: keyof TextDecoration) =>
            textDecorators[key](style));
    }

    return <span style={style} {...attributes}>{children}</span>;
};


const initialValue: Descendant[] = [
    {
        type: "heading",
        level: 1,
        children: [
            { text: "A heading!", decoration: { italic: true, underline: true } },
        ],
    },
    {
        type: "paragraph",
        children: [
            { text: "A line of text in a " },
            { text: "paragraph", decoration: { bold: true } },
            { text: "." },
        ],
    },
    { type: "paragraph", children: [{text: ""}] },
    {
        type: "block-quote",
        children: [
            {
                type: "heading",
                level: 1,
                children: [
                    { text: "A heading!", decoration: { italic: true, underline: true } },
                ],
            },
            {
                type: "paragraph",
                children: [
                    { text: "A line of text in a " },
                    { text: "paragraph", decoration: { bold: true } },
                    { text: "." },
                ],
            },
        ],
    }
];


export default function App () {
    const [editor] = useState(() => withHistory(withReact(createEditor())));

    const renderElement = useCallback(elementRenderer, []);
    const renderLeaf = useCallback(leafRenderer, []);

    return <Body>
        <Slate editor={editor} initialValue={initialValue}>
            <Editable
                onKeyDown={e => {
                    if (e.ctrlKey || e.altKey) e.preventDefault();

                    if (e.key === "z" && e.ctrlKey) {
                        VoxEditor.undo(editor);
                    } else if (e.key === "y" && e.ctrlKey) {
                        VoxEditor.redo(editor);
                    }
                }}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
            />
        </Slate>
    </Body>;
}
