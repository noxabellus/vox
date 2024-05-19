import { ReactElement, memo } from "react";
import { RenderLeafProps } from "slate-react";

import { Text } from "Document/Text";


export default function leafRendererMemo (props: RenderLeafProps): ReactElement {
    return <MemoLeaf {...props} />;
}

const MemoLeaf = memo(leafRenderer, (prev, next) => prev.leaf === next.leaf);

export function leafRenderer ({leaf, attributes, children}: RenderLeafProps): ReactElement {
    console.info("rendering leaf");

    const style = {};

    Text.applyTextFormat(leaf, style);

    return <span style={style} {...attributes}>{children}</span>;
};
