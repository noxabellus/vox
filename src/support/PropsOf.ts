import { HTMLProps, ReactHTMLElement } from "react";
import ValueOf from "./ValueOf";

type PropQueryTable = {
    FC: React.FC;
    C: React.Component;
    CC: React.ComponentClass<any>;
    F: (...args: any) => any;
    H: ReactHTMLElement<any>;
}

type PropsOfFC<C extends PropQueryTable["FC"]> = {
    [K in keyof C["propTypes"]]: C["propTypes"][K] extends React.Validator<infer P>
        ? P
        : K
};
type PropsOfF<C extends PropQueryTable["F"]> = Parameters<C>[0]
type PropsOfC<C extends PropQueryTable["C"]> = C extends React.Component<infer P> ? P : never;
type PropsOfCC<C extends PropQueryTable["CC"]> = C extends React.ComponentClass<infer P> ? P : never;
type PropsOfH<C extends PropQueryTable["H"]> = C extends ReactHTMLElement<infer H> ? HTMLProps<H> : never;

export type PropQueryable = ValueOf<PropQueryTable>;

export type PropsOf<C extends PropQueryable> =
    C extends PropQueryTable["FC"] ? PropsOfFC<C> :
    C extends PropQueryTable["C"] ? PropsOfC<C> :
    C extends PropQueryTable["CC"] ? PropsOfCC<C> :
    C extends PropQueryTable["F"] ? PropsOfF<C> :
    C extends PropQueryTable["H"] ? PropsOfH<C> :
    any;


export default PropsOf;
