import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { draftjsToMd, mdToDraftjs } from "draftjs-md-converter";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { EditorProps } from "react-draft-wysiwyg";

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
    <>
      <style>{`
        .editor {
          padding: 6px 5px 0;
          border-radius: 2px;
          border: 1px solid #f1f1f1;
          background: #fff;
        }
      `}</style>
      <Editor
        toolbar={toolbarOptions}
        editorState={editorState}
        wrapperClassName="demo-wrapper"
        editorClassName="editor"
        onEditorStateChange={onEditorStateChange}
      />
    </>
  );
};
