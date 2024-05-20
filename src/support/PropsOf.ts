import { Component, ComponentClass, FC, HTMLProps, ReactHTMLElement } from "react";
import PropTypes from "prop-types";
import { IStyledComponent } from "styled-components";

import ValueOf from "./ValueOf";


type PropQueryTable = {
    SC: IStyledComponent<"web", any>,
    FC: FC<any>,
    C: Component<any, any>,
    CC: ComponentClass<any>,
    F: (...args: any) => any,
    H1: ReactHTMLElement<any>,
    H2: HTMLElement,
}

type PropsOfSC<C extends PropQueryTable["SC"]> = C extends IStyledComponent<"web", infer P> ? P : never;
type PropsOfFC<C extends PropQueryTable["FC"]> = {
    [K in keyof C["propTypes"]]: C["propTypes"][K] extends PropTypes.Validator<infer P>
        ? P
        : K
};
type PropsOfF<C extends PropQueryTable["F"]> = Parameters<C>[0]
type PropsOfC<C extends PropQueryTable["C"]> = C extends Component<infer P> ? P : never;
type PropsOfCC<C extends PropQueryTable["CC"]> = C extends ComponentClass<infer P> ? P : never;
type PropsOfH1<C extends PropQueryTable["H1"]> = C extends ReactHTMLElement<infer H> ? HTMLProps<H> : never;
type PropsOfH2<C extends PropQueryTable["H2"]> = C extends HTMLElement ? HTMLProps<C> : never;

export type PropQueryable = ValueOf<PropQueryTable>;

export type PropsOf<C extends PropQueryable> =
    C extends PropQueryTable["SC"] ? PropsOfSC<C> :
    C extends PropQueryTable["FC"] ? PropsOfFC<C> :
    C extends PropQueryTable["C"] ? PropsOfC<C> :
    C extends PropQueryTable["CC"] ? PropsOfCC<C> :
    C extends PropQueryTable["F"] ? PropsOfF<C> :
    C extends PropQueryTable["H1"] ? PropsOfH1<C> :
    C extends PropQueryTable["H2"] ? PropsOfH2<C> :
    any;


export default PropsOf;
