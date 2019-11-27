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
      <Title data-cy="homepage-header">Welcome to the app</Title>
      <Paragraph>This is paragraph text</Paragraph>
    </SharedLayout>
  );
}
