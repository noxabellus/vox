import PropsOf from "Support/PropsOf";
import styled from "styled-components";

export type SvgProps = LocalSvgProps & PropsOf<HTMLDivElement>;

type LocalSvgProps = {
    src: string,
};

const SvgDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
`;


export default function Svg({src, ...props}: SvgProps) {
    return <SvgDiv dangerouslySetInnerHTML={{__html: src}} {...props} />;
};
