import * as React from "react";
import { Typography } from "antd";
const { Title, Paragraph } = Typography;
import SharedLayout from "../components/SharedLayout";

// Convenience helper
// const Li = ({ children, ...props }: any) => (
//   <li {...props}>
//     <Typography>{children}</Typography>
//   </li>
// );

export default function Home() {
  return (
    <SharedLayout title="Home">
      <Title data-cy="homepage-header">Welcome to the Daylily Catalog</Title>
      <Paragraph>
        Create an account or sign in, then click catalog above to begin.
      </Paragraph>
    </SharedLayout>
  );
}
