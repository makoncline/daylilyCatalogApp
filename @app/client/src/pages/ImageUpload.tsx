import {
  CreateUploadUrlMutation,
  useCreateUploadUrlMutation,
} from "@app/graphql";
import { Button } from "antd";
import axios from "axios";
import { GraphQLError } from "graphql";
import Image from "next/image";
import React from "react";

function UploadFile({
  file,
  keyPrefix,
  handleUploadComplete,
  register,
}: {
  file: File;
  keyPrefix: string;
  handleUploadComplete: (file: File, url: string, key: string) => void;
  register: (uploadFunction: () => Promise<void>) => void;
}) {
  const [progress, setProgress] = React.useState<number | null>(null);
  const [url, setUrl] = React.useState<string | null>(null);
  const [key, setKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [createUploadUrl] = useCreateUploadUrlMutation();

  const uploadFile = React.useCallback(async () => {
    const contentType = file.type || "N/A";
    let createUploadUrlData: CreateUploadUrlMutation | null = null;
    let createUploadUrlErrors: GraphQLError[] | null = null;
    try {
      const { data, errors } = await createUploadUrl({
        variables: {
          input: {
            keyPrefix,
            contentType,
          },
        },
      });
      createUploadUrlData = data ?? null;
      createUploadUrlErrors = errors ? errors.slice() ?? null : null;
    } catch (e: any) {
      setError(e);
    }

    if (createUploadUrlErrors) {
      setError(createUploadUrlErrors[0]);
      return;
    }
    if (!createUploadUrlData?.createUploadUrl) return;
    const { uploadUrl, url, key } = createUploadUrlData.createUploadUrl;
    setUrl(url);
    setKey(key);
    await axios
      .put(uploadUrl, file, {
        onUploadProgress: (progressEvent: ProgressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.round((loaded / total) * 100);
          setProgress(percent);
        },
      })
      .then(
        () => {
          setProgress(100);
          console.log("upload success: ", key);
          handleUploadComplete(file, url, key);
        },
        (err) => {
          setError(err);
          console.log("upload error: ", key);
          setProgress(null);
        }
      );
  }, [createUploadUrl, file, handleUploadComplete, keyPrefix]);

  React.useEffect(() => {
    register(uploadFile);
  }, [register, uploadFile]);

  return (
    <div>
      {getImagePreview(file)}
      {progress ? <p>{progress}%</p> : null}
      {url ? <a href={url}>{url}</a> : null}
      {key ? <p>{key}</p> : null}
      {error ? <p>{error.message}</p> : null}
    </div>
  );
}

export function ImageUpload({
  keyPrefix,
  handleImageUploaded,
  handleBeforeUpload,
}: {
  keyPrefix: string;
  handleImageUploaded: (url: string, key: string) => void;
  handleBeforeUpload: (files: File[]) => boolean;
}) {
  const [status, setStatus] = React.useState<
    "idle" | "dragging" | "dropped" | "uploading"
  >("idle");
  const [files, setFiles] = React.useState<File[]>([]);
  const dropRef = React.createRef<HTMLLabelElement>();
  const [uploadFunctions, setUploadFunctions] = React.useState<(() => void)[]>(
    []
  );

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
  }

  const handleDrop = React.useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleReset();
      setStatus("dropped");
      const files = e.dataTransfer?.files;
      handleFiles(files);
    },
    [setStatus]
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

  function handleFiles(files: FileList | null | undefined) {
    if (files) {
      setFiles(Array.from(files));
    } else {
      setFiles([]);
    }
  }
  function handleUpload() {
    if (files.length === 0) {
      alert("No files to upload");
      return;
    }
    if (!handleBeforeUpload(files)) return;
    uploadFunctions.forEach((runUpload) => runUpload());
  }
  const registerUploadFunction = React.useCallback(
    (uploadFunction: () => void) => {
      setUploadFunctions((prev) => [...prev, uploadFunction]);
    },
    []
  );
  const handleUploadComplete = React.useCallback(
    (file: File, url: string, key: string) => {
      setFiles((prev) => prev.filter((f) => f !== file));
      handleImageUploaded(url, key);
    },
    [handleImageUploaded]
  );
  return (
    <div>
      <input
        type="file"
        id="fileElem"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        multiple
      />
      <p>{status}</p>
      <label htmlFor="fileElem" ref={dropRef}>
        Select some files
      </label>
      {files.map((file) => (
        <UploadFile
          file={file}
          keyPrefix={keyPrefix}
          handleUploadComplete={handleUploadComplete}
          key={file.name}
          register={registerUploadFunction}
        />
      ))}
      <Button onClick={handleReset}>Reset</Button>
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
}

function getImagePreview(file: File): JSX.Element {
  const src = URL.createObjectURL(file);
  const onLoad = function () {
    URL.revokeObjectURL(src);
  };
  const img = (
    <Image src={src} onLoad={onLoad} layout="fill" objectFit="cover" />
  );
  const detail = <span>{file.name + ": " + file.size + " bytes"}</span>;
  return (
    <div>
      {img} {detail}
    </div>
  );
}
