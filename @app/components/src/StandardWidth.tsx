import { Space } from "@app/design";
import React, { FC } from "react";

export interface StandardWidthProps {
  children: React.ReactNode;
}

export const StandardWidth: FC<StandardWidthProps> = ({ children }) => (
  <Space style={{ padding: "1rem", maxWidth: "80rem", margin: "0 auto" }}>
    <Space direction="column">{children}</Space>
  </Space>
);
