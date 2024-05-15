import { ReactElement } from "react";
import { RenderLeafProps } from "slate-react";

import { Text } from "Document/Text";


export default function leafRenderer ({leaf, attributes, children}: RenderLeafProps): ReactElement {
    console.log(`leaf "${leaf.text}"`, Object.keys((leaf as any).decoration || {}).join(", "));
    const style = {};

    if (Text.isFormattedText(leaf)) {
        Object.keys(leaf.decoration).forEach((key: keyof Text.TextDecoration) =>
            Text.textDecorators[key](style));
    }

    return <span style={style} {...attributes}>{children}</span>;
};
