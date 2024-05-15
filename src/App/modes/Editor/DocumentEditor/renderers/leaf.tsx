import { ReactElement } from "react";
import { RenderLeafProps } from "slate-react";

import { Text } from "Document/Text";


export default function leafRenderer ({leaf, attributes, children}: RenderLeafProps): ReactElement {
    const style = {};

    Text.applyTextFormat(leaf, style);

    return <span style={style} {...attributes}>{children}</span>;
};
