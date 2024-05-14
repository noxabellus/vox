import { Descendant } from "slate";

import { SlateContext, useSlate } from "./slate";
import DocEditor from "./DocEditor";


export type EditorProps = {
    initialValue: Descendant[],
};


export default function Editor ({initialValue}: EditorProps) {
    const slate = useSlate();

    return <SlateContext editor={slate} initialValue={initialValue}>
        <DocEditor />
    </SlateContext>;
}

