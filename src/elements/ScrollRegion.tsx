import PropsOf, { PropQueryable } from "Support/PropsOf";
import { PropsWithChildren, ReactHTMLElement } from "react";
import { Scrollbar } from "react-scrollbars-custom";
import { ElementPropsWithElementRef } from "react-scrollbars-custom/dist/types/types";
import styled from "styled-components";


const ScrollStyles = styled(Scrollbar)`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;

    & .ScrollbarsCustom-Wrapper {
        inset: 0px;
        overflow: hidden;
    }

    & .ScrollbarsCustom-Content {
        display: flex;
        min-width: max-content;
        flex-grow: 1;
        background: blue;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    & .ScrollbarsCustom-Track {
        opacity: 0.4;
        position: absolute;
        overflow: hidden;
        border-radius: 5px;
        background: grey;
        border: 1px solid white;
        user-select: none;
    }

    & .ScrollbarsCustom-TrackY {
        width: 10px;
        height: calc(100% - 60px);
        top: 30px;
        right: 10px;
    }

    & .ScrollbarsCustom-TrackX {
        height: 10px;
        width: calc(100% - 60px);
        bottom: 10px;
        left: 30px;
    }

    & .ScrollbarsCustom-Thumb {
        border-radius: 5px;
        background: #c700c7;
        border: 1px solid white;
    }

    & .ScrollbarsCustom-ThumbY {
        width: 100%;
        border-left: none;
        border-right: none;
    }

    & .ScrollbarsCustom-ThumbX {
        height: 100%;
        border-top: none;
        border-bottom: none;
    }
`;

export type ScrollRegionProps<C extends PropQueryable> = LocalScrollRegionProps<C> & Omit<PropsWithChildren<PropsOf<C>>, "key">;

type LocalScrollRegionProps<C extends PropQueryable> = {
    contentNode?: C
};


export default function ScrollRegion<C extends PropQueryable = ReactHTMLElement<HTMLDivElement>> ({children, contentNode, style, ...props}: ScrollRegionProps<C>) {
    const ContentNode = (contentNode || "div") as any;

    return <ScrollStyles
        disableTracksWidthCompensation={true}
        noDefaultStyles={true}
        contentProps={{renderer: ({key, elementRef, style: style2, ...props2}: ElementPropsWithElementRef<PropsOf<C>>) => {
            return <ContentNode key={key} ref={elementRef} {...{...{...props, ...props2, style: {...style, ...style2}}}} />;
        }}}
    >
        {children}
    </ScrollStyles>;
};
