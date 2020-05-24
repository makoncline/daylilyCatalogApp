import MarkdownIt from "markdown-it";
import dynamic from "next/dynamic";
import React from "react";

export const MarkdownInput = ({
  handleSetBio,
  value,
}: {
  handleSetBio: (text: string | null | undefined) => void;
  value: string | null | undefined;
}) => {
  const mdParser = new MarkdownIt();
  const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
    ssr: false,
  });
  function handleEditorChange({
    text,
  }: {
    html: string;
    text: string | null | undefined;
  }) {
    handleSetBio(text);
  }
  return (
    <MdEditor
      plugins={["header", "fonts", "link", "table", "full-screen"]}
      value={value ? value : undefined}
      style={{ height: "500px" }}
      renderHTML={(text) => mdParser.render(text)}
      onChange={handleEditorChange}
    />
  );
};
