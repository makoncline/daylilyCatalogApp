import { Button, Heading, Space, Thumbnail } from "@app/design";
import type { CreateUploadUrlMutation } from "@app/graphql";
import { useCreateUploadUrlMutation } from "@app/graphql";
import axios from "axios";
import React from "react";
import styled from "styled-components";

import { Image } from "./Image";

function useFileUpload(
  file: File,
  keyPrefix: string,
  callback: (fileName: string, key: string, url: string) => void
) {
  const [createUploadUrl] = useCreateUploadUrlMutation();
  const [uploadConfig, setUploadConfig] = React.useState<Pick<
    NonNullable<CreateUploadUrlMutation["createUploadUrl"]>,
    "uploadUrl" | "key" | "url"
  > | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const getUploadConfig = React.useCallback(() => {
    return createUploadUrl({
      variables: {
        input: {
          keyPrefix,
          contentType: file.type,
        },
      },
    }).then(
      ({ data }) => setUploadConfig(data?.createUploadUrl || null),
      (error) => setError(error)
    );
  }, [createUploadUrl, file, keyPrefix]);

  React.useEffect(() => {
    getUploadConfig();
  }, [getUploadConfig]);

  const runUpload = React.useCallback(() => {
    const { uploadUrl, url, key } = uploadConfig || {};
    if (uploadUrl && url && key) {
      axios
        .put(uploadUrl, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            if (total) {
              setProgress(Math.round((loaded / total) * 100));
            }
          },
        })
        .then(
          () => {
            setProgress(100);
            console.log("upload success: ", key);
            callback(file.name, key, url);
          },
          (err) => {
            setProgress(null);
            setError(err);
            console.error("upload error: ", key);
          }
        );
    } else {
      throw new Error(`upload config is not ready for ${file.name}`);
    }
  }, [callback, file, uploadConfig]);

  return { runUpload: uploadConfig ? runUpload : null, progress, error };
}

function UploadFile({
  file,
  keyPrefix,
  onUpload,
  register,
}: {
  file: File;
  keyPrefix: string;
  onUpload: (fileName: string, key: string, url: string) => void;
  register: (name: string, run: () => void) => void;
}) {
  const { runUpload, progress, error } = useFileUpload(
    file,
    keyPrefix,
    onUpload
  );
  const [registered, setRegistered] = React.useState(false);

  React.useEffect(() => {
    if (runUpload && !registered) {
      register(file.name, runUpload);
      setRegistered(true);
    }
  }, [file.name, register, registered, runUpload]);

  return (
    <div>
      {getImagePreview(file)}
      {progress ? <p>{progress}%</p> : null}
      {error ? <p>{error.message}</p> : null}
    </div>
  );
}

export function ImageUpload({
  keyPrefix,
  handleImageUploaded,
  handleBeforeUpload = (_: File[]) => true,
  single = false,
  title = "Upload Image",
  showTitle = true,
}: {
  keyPrefix: string;
  handleImageUploaded: (key: string, url: string) => void;
  handleBeforeUpload?: (files: File[]) => boolean;
  single?: boolean;
  title?: string;
  showTitle?: boolean;
}) {
  const [_, setStatus] = React.useState<"idle" | "dragging" | "dropped">(
    "idle"
  );
  const [files, setFiles] = React.useState<File[]>([]);
  const dropRef = React.createRef<HTMLLabelElement>();
  const [uploadFunctions, setUploadFunctions] = React.useState<
    { name: string; run: () => void }[]
  >([]);

  function handleDragEnter(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    setStatus("dragging");
  }
  function handleDragOver(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    setStatus("dragging");
  }
  function handleDragLeave(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    setStatus("idle");
  }

  function handleReset() {
    setStatus("idle");
    setFiles([]);
    setUploadFunctions([]);
  }

  const handleFiles = React.useCallback(
    (files: FileList | null | undefined) => {
      if (files && handleBeforeUpload(Array.from(files))) {
        setFiles(Array.from(files));
      } else {
        setFiles([]);
      }
    },
    [handleBeforeUpload]
  );

  const handleDrop = React.useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setStatus("dropped");
      handleReset();
      const files = e.dataTransfer?.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  React.useEffect(() => {
    const dropArea = dropRef.current;
    if (dropArea) {
      dropArea.addEventListener("dragenter", handleDragEnter);
      dropArea.addEventListener("dragover", handleDragOver);
      dropArea.addEventListener("dragleave", handleDragLeave);
      dropArea.addEventListener("drop", handleDrop);
    }
    return () => {
      if (dropArea) {
        dropArea.removeEventListener("dragenter", handleDragEnter);
        dropArea.removeEventListener("dragover", handleDragOver);
        dropArea.removeEventListener("dragleave", handleDragLeave);
        dropArea.removeEventListener("drop", handleDrop);
      }
    };
  }, [dropRef, handleDrop]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleReset();
    handleFiles(e.target.files);
  }

  function handleUpload() {
    if (files.length === 0) {
      alert("Please select files to upload");
      return;
    }
    if (!handleBeforeUpload(files)) return;
    uploadFunctions.forEach((uploadFn) => uploadFn.run());
  }
  const registerUploadFunction = React.useCallback(
    (name: string, run: () => void) => {
      setUploadFunctions((prev) => [...prev, { name, run }]);
    },
    []
  );
  const handleUploadComplete = React.useCallback(
    (fileName: string, key: string, url: string) => {
      setFiles((prev) => prev.filter((f) => f.name !== fileName));
      setUploadFunctions((prev) => prev.filter((f) => f.name !== fileName));
      handleImageUploaded(key, url);
    },
    [handleImageUploaded]
  );
  return (
    <div>
      <Space direction="column">
        {showTitle && <Heading level={3}>{title}</Heading>}
        {files.length === 0 ? (
          <div>
            <input
              type="file"
              id="fileElem"
              accept="image/*"
              className="sr-only"
              onChange={handleChange}
              multiple={!single}
            />
            <FileSelect htmlFor="fileElem" ref={dropRef}>
              <p>
                Drag & drop {single ? `image` : `images`} here or{" "}
                <a href="" style={{ pointerEvents: "none" }}>
                  browse files
                </a>
              </p>
            </FileSelect>
          </div>
        ) : null}
        {files.length > 0 && (
          <>
            <Space direction="column">
              {files.map((file) => (
                <UploadFile
                  file={file}
                  keyPrefix={keyPrefix}
                  onUpload={handleUploadComplete}
                  register={registerUploadFunction}
                  key={file.name}
                />
              ))}
            </Space>
            <Space>
              <Button onClick={handleReset}>Reset</Button>
              <Button
                onClick={handleUpload}
                disabled={uploadFunctions.length !== files.length}
              >
                Upload
              </Button>
            </Space>
          </>
        )}
      </Space>
    </div>
  );
}

function getImagePreview(file: File): JSX.Element {
  const src = URL.createObjectURL(file);
  const onLoad = function () {
    URL.revokeObjectURL(src);
  };
  return (
    <Space direction="row">
      <Thumbnail>
        <Image src={src} alt={file.name} onLoad={onLoad} />
      </Thumbnail>
      <div>
        <p>{file.name}</p>
      </div>
    </Space>
  );
}

const FileSelect = styled.label`
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: var(--border-size-1) dashed var(--text-1);
  border-radius: var(--radius-1);
  padding: var(--size-4);
  text-align: center;
`;
