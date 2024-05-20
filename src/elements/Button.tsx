import { ForwardedRef, forwardRef } from "react";
import styled from "styled-components";

import { useApp } from "Model/App";

import Svg from "./Svg";
import PropsOf from "Support/PropsOf";


export type ButtonProps = PropsOf<typeof ButtonBase>;


export type Button = {
    Icon: typeof Icon;
    Serif: typeof Serif;
    InlineIcon: typeof InlineIcon;
} & typeof Plain;

export type IconProps
    = {svg: string}
    & ButtonProps
    ;


const ButtonBase = styled.button`
    background: rgb(var(--element-color));
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    padding: .25em .5em;
    line-height: 1em;

    font-family: var(--sans-family);
    border-width: 1px;
    border-style: solid;
    border-radius: var(--minor-border-radius);

    outline-color: rgb(var(--primary-color));
    border-color: rgb(var(--primary-color));
    color: rgb(var(--primary-color));
    stroke: rgb(var(--primary-color));
    fill: rgb(var(--primary-color));

    &.selected {
        outline-color: rgb(var(--accent-color));
        border-color: rgb(var(--accent-color));
        color: rgb(var(--accent-color));
        stroke: rgb(var(--accent-color));
        fill: rgb(var(--accent-color));
    }

    &:hover {
        /* outline-color: rgb(var(--accent-color));
        border-color: rgb(var(--accent-color));
        color: rgb(var(--accent-color));
        stroke: rgb(var(--accent-color));
        fill: rgb(var(--accent-color)); */
        box-shadow: 0 0 0.25em 0.2em rgba(var(--accent-color), 0.5) inset;
        text-shadow: 0 0 0.25em rgba(var(--accent-color), 1.0);
    }

    &.selected:hover {
        /* outline-color: rgb(var(--primary-color));
        border-color: rgb(var(--primary-color));
        color: rgb(var(--primary-color));
        stroke: rgb(var(--primary-color));
        fill: rgb(var(--primary-color)); */
        box-shadow: 0 0 0.25em 0.1em rgba(var(--primary-color), 0.5) inset;
        text-shadow: 0 0 0.25em rgba(var(--primary-color), 0.8);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

`;

const InlineSvg = styled.button`
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;


export const Plain = forwardRef(({children, disabled, ...props}: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const [app] = useApp();
    return <ButtonBase ref={ref} onMouseDown={e => e.preventDefault()} disabled={disabled || app.lockIO} {...props}>{children}</ButtonBase>;
});

Plain.displayName = "Button";


export const Icon = ({svg, ...props}: IconProps) => {
    return <Plain {...props}><Svg src={svg}/></Plain>;
};

Icon.displayName = "Button.Icon";


export const InlineIcon = ({svg, disabled, ...props}: IconProps) => {
    const [app] = useApp();
    return <InlineSvg onMouseDown={e => e.preventDefault()} disabled={disabled || app.lockIO} {...props}><Svg src={svg}/></InlineSvg>;
};

InlineIcon.displayName = "Button.InlineIcon";


export const Serif = styled(Plain)`
    font-family: var(--serif-family);
`;

Serif.displayName = "Button.Serif";


const defs = Object.assign(Plain, {Icon, Serif, InlineIcon}) as Button;

export default defs;
