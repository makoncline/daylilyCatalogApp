import { ConsoleSqlOutlined } from "@ant-design/icons";
import {
  CreateUploadUrlMutation,
  useCreateUploadUrlMutation,
} from "@app/graphql";
import axios from "axios";
import { GraphQLError } from "graphql";
import React from "react";

export function ImageUpload({ keyPrefix }: { keyPrefix: string }) {
  const [status, setStatus] = React.useState<
    "idle" | "dragging" | "dropped" | "uploading"
  >("idle");
  const [value, setValue] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [key, setKey] = React.useState<string | null>(null);
  const [url, setUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [createUploadUrl] = useCreateUploadUrlMutation();
  const dropRef = React.createRef<HTMLLabelElement>();

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

  const uploadFile = React.useCallback(
    async (file: File) => {
      const contentType = file.type || "N/A";
      setStatus("uploading");
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
        setStatus("idle");
      }

      if (createUploadUrlErrors) {
        setError(createUploadUrlErrors[0]);
        setStatus("idle");
        return;
      }
      if (!createUploadUrlData?.createUploadUrl) return;
      const { uploadUrl, url, key } = createUploadUrlData.createUploadUrl;
      console.log("url", url);
      console.log("key", key);
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
          (response) => {
            setProgress(100);
            setStatus("idle");
            console.log("response: ", response);
          },
          (err) => {
            setError(err);
            setProgress(null);
          }
        );
    },
    [createUploadUrl, keyPrefix]
  );

  const handleFile = React.useCallback(
    (file: File) => {
      console.log("file: ", file);
      setValue(file);
      uploadFile(file);
    },
    [setValue, uploadFile]
  );

  const handleDrop = React.useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setStatus("dropped");
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [setStatus, handleFile]
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
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  return (
    <div>
      <input
        type="file"
        id="fileElem"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
      />
      <p>{status}</p>
      <label htmlFor="fileElem" ref={dropRef}>
        Select some files
      </label>
      {value ? getImagePreview(value) : null}
      {progress ? <p>{progress}%</p> : null}
      {url ? <a href={url}>{url}</a> : null}
      {key ? <p>{key}</p> : null}
      {error ? <p>{error.message}</p> : null}
    </div>
  );
}

function getImagePreview(file: File): JSX.Element {
  const src = URL.createObjectURL(file);
  const onLoad = function () {
    URL.revokeObjectURL(src);
  };
  const img = <img src={src} onLoad={onLoad} />;
  const detail = <span>{file.name + ": " + file.size + " bytes"}</span>;
  return (
    <div>
      {img} {detail}
    </div>
  );
}

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
// const fileTypes = [
//   "image/apng",
//   "image/bmp",
//   "image/gif",
//   "image/jpeg",
//   "image/pjpeg",
//   "image/png",
//   "image/svg+xml",
//   "image/tiff",
//   "image/webp",
//   "image/x-icon",
// ];

// function validFileType(file) {
//   return fileTypes.includes(file.type);
// }
