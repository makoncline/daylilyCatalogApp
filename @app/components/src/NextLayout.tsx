import { Layout } from "@app/design";
import React from "react";

import { NextNavigation } from "./";

export const NextLayout = ({ children }: { children: React.ReactNode }) => {
  return <Layout navigation={<NextNavigation />}>{children}</Layout>;
};
