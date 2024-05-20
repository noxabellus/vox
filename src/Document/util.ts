import { stringWords } from "Support/text";

import { isText } from "./Text";
import { Descendant } from "./hierarchy";


export function fragmentWords (fragment: Descendant[]): number {
    return fragment.reduce((acc, node) =>
        acc + (isText(node)? stringWords(node.text): fragmentWords(node.children))
    , 0);
}
