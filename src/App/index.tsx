import "Support/remote";

import { styled } from "styled-components";

import { Descendant } from "slate";
import Editor from "./modes/Editor";



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
    return <Body>
        <Editor initialValue={initialValue}/>
    </Body>;
}
