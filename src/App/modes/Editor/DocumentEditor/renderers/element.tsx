import { ReactElement, memo } from "react";
import { RenderElementProps } from "slate-react";


export default function elementRendererMemo (props: RenderElementProps): ReactElement {
    return <MemoElement {...props} />;
}

const MemoElement = memo(elementRenderer, (prev, next) => prev.element === next.element);

export function elementRenderer ({element, attributes, children}: RenderElementProps): ReactElement {
    console.info("rendering element");

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
