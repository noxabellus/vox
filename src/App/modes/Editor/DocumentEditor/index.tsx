import { CSSProperties, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import RAF from "Support/RAF";

import ScrollRegion from "Elements/ScrollRegion";

import { Api, RangeRef, Selection, Slate, Editable } from "Model/Slate";
import { App, useApp } from "Model/App";
import { deriveEditorFromApp } from "Model/Editor";
import { makeRangeRef, updateRangeRef } from "Model/util";

import leafRenderer from "./renderers/leaf";
import elementRenderer from "./renderers/element";
import { TextStyles, SelectionState, selectionStep, selectionStop } from "./selection";
import { HexRgba } from "Support/color";


export type DocumentEditorProps = {
    placeholder?: string,
    style?: CSSProperties,
    onBlur?: () => Promise<void> | void,
    onFocus?: (selection: Selection) => Promise<void> | void,
    onKeyDown?: (e: KeyboardEvent, app: App, dispatch: App.Dispatch) => Promise<void> | void,
    onKeyUp?: (e: KeyboardEvent, app: App, dispatch: App.Dispatch) => Promise<void> | void,
} & Slate.ContextCallbacks;


const StyledEditable = styled(Editable)`
    padding: 1em;

    height: fit-content;
    width: 8.5in;

    & h1 {
        font-size: 2em;
        line-height: 1.25em;
    }

    & blockquote {
        border: 1px solid #202020;
        border-radius: .25em;
        padding: 1em;
        margin: 1em;
    }
`;


const defaultTextColor = "#000000FF" as HexRgba; // TODO: use theme


export default function DocumentEditor ({style, placeholder, onBlur, onFocus, onChange, onSelectionChange, onValueChange, onKeyDown, onKeyUp}: DocumentEditorProps) {
    const [app, appDispatch] = useApp();
    const [editor] = deriveEditorFromApp(app, appDispatch);

    const [lastSelection, setLastSelection] = useState<RangeRef | null>(null);
    const [selection, setSelection] = useState<RangeRef | null>(makeRangeRef(editor.slate, editor.slate.selection));
    const [focused, setFocused] = useState<boolean>(Api.isFocused(editor.slate));

    const [textColor, setTextColor] = useState<HexRgba>(Api.marks(editor.slate)?.foreground ?? defaultTextColor);

    const selected = (selection?.current ?? lastSelection?.current) ?? null;

    const root = useRef<HTMLDivElement>(null);

    const [updateSelectRAF, stopSelectRAF] = useMemo(() => {
        console.log("RAF memo");
        return RAF<SelectionState>({
            state: {
                slate: editor.slate,
                selected,
            },
            onStep: selectionStep,
            onStop: selectionStop,
        });
    }, []);

    useEffect(() => {
        if (root.current) {
            console.log("setting root");
            updateSelectRAF(state => { state.slate = editor.slate; state.root = root.current as HTMLDivElement; });
        }

        return () => {
            console.log("stopping RAF");
            stopSelectRAF();
        };
    }, [root]);

    useEffect(() => {
        console.log("updating selected");
        updateSelectRAF(state => { state.slate = editor.slate; state.selected = selected; });
        const marks = Api.marks(editor.slate);
        setTextColor(marks?.foreground ?? defaultTextColor);
    }, [selected]);


    return <Slate.Context
        slate={editor.slate}

        onChange={value => onChange?.(value)}
        onSelectionChange={newSelection => {
            setLastSelection(updateRangeRef(selection));
            setSelection(makeRangeRef(editor.slate, newSelection));
            onSelectionChange?.(newSelection);
        }}
        onValueChange={value => onValueChange?.(value)}
    >
        <ScrollRegion>
            <TextStyles ref={root} $focus={focused} $textColor={textColor}>
                <StyledEditable
                    onBlur={_ => {
                        if (document.hasFocus()) {
                            setFocused(false);

                            setLastSelection(updateRangeRef(selection));
                            setSelection(null);

                            onBlur?.();
                        }
                    }}
                    onFocus={_ => {
                        setFocused(true);

                        const newSelection = editor.slate.selection;

                        setLastSelection(updateRangeRef(selection));
                        setSelection(makeRangeRef(editor.slate, newSelection));

                        onFocus?.(newSelection);
                    }}
                    onKeyDown={e => onKeyDown?.(e, app, appDispatch)}
                    onKeyUp={e => onKeyUp?.(e, app, appDispatch)}

                    renderLeaf={leafRenderer}
                    renderElement={elementRenderer}

                    style={style}
                    placeholder={placeholder}

                    readOnly={false} // TODO: lockIO

                    disableDefaultStyles={false}
                />
            </TextStyles>
        </ScrollRegion>
    </Slate.Context>;
}
