import { ReactElement } from "react";
import { RenderElementProps } from "slate-react";


export default function elementRenderer ({element, attributes, children}: RenderElementProps): ReactElement {
    console.log("rendering element", element.type);
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
