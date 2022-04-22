import { Spinner } from "@app/design";
import React from "react";

export const SpinPadded = () => (
  <div
    style={{
      padding: "2rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Spinner />
  </div>
);
