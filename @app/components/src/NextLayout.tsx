import { companyName } from "@app/config";
import { Layout } from "@app/design";
import React from "react";

import { NextNavigation } from "./";

export const NextLayout = ({
  children,
  handleLogout,
  isLoggedIn,
  currentUrl,
}: {
  children: React.ReactNode;
  handleLogout: () => void;
  isLoggedIn: boolean;
  currentUrl: string;
}) => {
  return (
    <Layout
      navigation={
        <NextNavigation
          currentUrl={currentUrl}
          handleLogout={handleLogout}
          isLoggedIn={isLoggedIn}
        />
      }
      footer={<Footer />}
    >
      {children}
    </Layout>
  );
};

const Footer = () => {
  return (
    <p>
      Copyright &copy; {new Date().getFullYear()} {companyName}. All rights
      reserved.
    </p>
  );
};
