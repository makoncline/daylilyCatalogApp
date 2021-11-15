import { css } from "styled-components";

type PositionProps = {
  x?: number;
  y?: number;
  yProp?: "top" | "bottom" | undefined;
  xProp?: "left" | "right" | undefined;
};

export const fixed = ({
  x = 0,
  y = 0,
  yProp = "top",
  xProp = "left",
}: PositionProps = {}) => css`
  position: fixed;
  ${`${yProp}: ${y};`}
  ${`${xProp}: ${x};`}
`;

export const absolute = ({
  x = 0,
  y = 0,
  yProp = "top",
  xProp = "left",
}: PositionProps = {}) => css`
  position: absolute;
  ${`${yProp}: ${y};`}
  ${`${xProp}: ${x};`}
`;
