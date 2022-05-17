import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { draftjsToMd, mdToDraftjs } from "draftjs-md-converter";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { EditorProps } from "react-draft-wysiwyg";
import styled from "styled-components";

const Editor = dynamic<EditorProps>(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

export const Wysiwyg = ({
  handleSetBio,
  value,
}: {
  handleSetBio: (text: string | null | undefined) => void;
  value: string | null | undefined;
}) => {
  const [editorState, setEditorState] = useState<any>();

  useEffect(() => {
    if (value) {
      const rawData = mdToDraftjs(value);
      const contentState = convertFromRaw(rawData);
      const newEditorState = EditorState.createWithContent(contentState);
      setEditorState(newEditorState);
    }
  }, [value]);

  const onEditorStateChange = (editorState: any) => {
    setEditorState(editorState);
    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const markdown = draftjsToMd(rawContentState);
    handleSetBio(markdown);
  };
  const toolbarOptions = {
    options: ["blockType", "inline", "list", "link", "history"],
    inline: {
      inDropdown: false,
      options: ["bold", "italic", "underline", "strikethrough"],
    },
    blockType: {
      inDropdown: true,
      options: ["Normal", "H1", "H2", "H3", "H4", "H5", "H6", "Code"],
    },
    list: {
      inDropdown: false,
      options: ["unordered", "ordered", "indent", "outdent"],
    },
    link: {
      inDropdown: false,
      options: ["link", "unlink"],
    },
    history: {
      inDropdown: false,
      options: ["undo", "redo"],
    },
  };
  return (
    <StyledEditor>
      <Editor
        toolbar={toolbarOptions}
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
      />
    </StyledEditor>
  );
};

const StyledEditor = styled.div`
  max-width: 100%;
  padding: var(--size-2);
  border: var(--hairline);
  background: var(--surface-1);
  .rdw-editor-toolbar {
    background: var(--surface-1);
  }
  .rdw-block-dropdown {
    color: black;
  }
`;
