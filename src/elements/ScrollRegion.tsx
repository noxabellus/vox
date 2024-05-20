import styled from "styled-components";
import { Scrollbar } from "react-scrollbars-custom";
import { ElementPropsWithElementRef } from "react-scrollbars-custom/dist/types/types";

import PropsOf, { PropQueryable } from "Support/PropsOf";


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
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    & .ScrollbarsCustom-Track {
        position: absolute;
        overflow: hidden;
        user-select: none;
        border-radius: var(--minor-border-radius);
        background: rgb(var(--element-color));
        border: 1px solid rgb(var(--accent-color));
        opacity: var(--scrollbar-opacity);
    }

    & .ScrollbarsCustom-TrackY {
        width: var(--scrollbar-width);
        height: calc(100% - var(--gap) * 4);
        top: calc(var(--gap) * 2);
        right: calc(var(--gap) * 2);
    }

    & .ScrollbarsCustom-TrackX {
        height: var(--scrollbar-width);
        width: calc(100% - (var(--scrollbar-width) + var(--gap) * 6));
        left: calc(var(--gap) * 2);
        bottom: calc(var(--gap) * 2);
    }

    & .ScrollbarsCustom-Thumb {
        border-radius: var(--minor-border-radius);
        background: rgba(var(--accent-color), 0.3);
        border: 1px solid rgb(var(--accent-color));
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

export type ScrollRegionProps<C> = LocalScrollRegionProps<C> & PropsOf<typeof ScrollStyles>;

type LocalScrollRegionProps<C> = {
    contentNode?: C
};


export default function ScrollRegion<C extends PropQueryable = HTMLDivElement> ({children, contentNode, ...props}: ScrollRegionProps<C>) {
    const ContentNode = (contentNode || "div") as any;

    return <ScrollStyles
        disableTracksWidthCompensation={true}
        noDefaultStyles={true}
        contentProps={{renderer: ({key, elementRef, ...props2}: ElementPropsWithElementRef<PropsOf<C>>) => {
            return <ContentNode key={key} ref={elementRef} {...props2} />;
        }}}
        {...props}
    >
        {children}
    </ScrollStyles>;
};
