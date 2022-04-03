import React from "react";
import styled from "styled-components";

function PropertyList({
  children,
  divider,
  column,
  padding,
}: {
  children: React.ReactNode;
  divider?: boolean;
  column?: boolean;
  padding?: string;
}) {
  return (
    <ListWrapper
      divider={divider}
      column={column}
      style={{ "--padding": padding } as React.CSSProperties}
    >
      {children}
    </ListWrapper>
  );
}

function PropertyListItem({
  children,
  label,
  inline,
}: {
  children: React.ReactNode;
  label?: string;
  inline?: boolean;
}) {
  return (
    <ItemWrapper inline={inline}>
      {label && <Label>{label}</Label>}
      {children}
    </ItemWrapper>
  );
}

export { PropertyList, PropertyListItem };

const ListWrapper = styled.div<{ divider?: boolean; column?: boolean }>`
  display: flex;
  & > *:not(:last-child) {
    border-right: ${({ divider }) => (divider ? `var(--hairline)` : "none")};
    padding-right: var(--padding, var(--size-4));
  }
  & > *:not(:first-child) {
    padding-left: var(--padding, var(--size-4));
  }
  ${({ column }) =>
    column &&
    `
      flex-direction: column;
      & > *:not(:last-child) {
        padding-right: unset;
        padding-bottom: var(--padding, var(--size-4));
      }
      & > *:not(:first-child) {
        padding-left: unset;
      }
  `}
`;
const ItemWrapper = styled.div<{ inline?: boolean }>`
  display: flex;
  flex-direction: column;
  ${({ inline }) =>
    inline &&
    `
    flex-direction: row;
    & > * {
      flex: 0 0 20%;
      min-width: 150px;
    }
  `}
`;
const Label = styled.div`
  color: var(--text-3);
  /* font-size: var(--font-size-0); */
`;
