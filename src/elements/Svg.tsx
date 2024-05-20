import PropsOf from "Support/PropsOf";

export type SvgProps = LocalSvgProps & PropsOf<HTMLDivElement>;

type LocalSvgProps = {
    src: string,
};


export default function Svg({src, style, ...props}: SvgProps) {
    return <div dangerouslySetInnerHTML={{__html: src}} style={{...style, display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1}} {...props} />;
};
