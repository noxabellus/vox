import styled from "styled-components";


export default styled.nav`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: var(--gap);
    color: rgb(var(--primary-color));
    background-color: rgb(var(--element-color));
    border: 1px solid rgb(var(--accent-color));
    padding: var(--gap);
    border-radius: var(--minor-border-radius);
    user-select: none;
`;
