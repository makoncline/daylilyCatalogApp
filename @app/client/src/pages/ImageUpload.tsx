import { useCreateUploadUrlMutation } from "@app/graphql";
import React from "react";

export function ImageUpload() {
  const [status, setStatus] = React.useState<"idle" | "dragging" | "dropped">(
    "idle"
  );
  const [fileList, setFileList] = React.useState<FileList | null>(null);
  const [createUploadUrl] = useCreateUploadUrlMutation();
  const dropRef = React.createRef<HTMLLabelElement>();
  const files = Array.from(fileList || []);

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
  const handleFiles = React.useCallback(
    (files: FileList) => {
      console.log("files: ", files);
      setFileList(files);
    },
    [setFileList]
  );

  function getImagePreview(file: File): JSX.Element {
    const src = URL.createObjectURL(file);
    const onLoad = function () {
      URL.revokeObjectURL(src);
    };
    const img = <img src={src} onLoad={onLoad} />;
    const detail = <span>{file.name + ": " + file.size + " bytes"}</span>;
    const item = (
      <li key={`${file.name}`}>
        {img}
        {detail}
      </li>
    );
    return item;
  }

  const handleDrop = React.useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setStatus("dropped");
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [setStatus, handleFiles]
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

  function sendFiles() {
    files.forEach((file) => {
      fileUpload(file);
    });
  }

  function fileUpload(file: File) {
    const reader = new FileReader();
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener(
      "progress",
      (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded * 100) / e.total);
          console.log(`${file.name}: ${percentage}%`);
          // use percentage
        }
      },
      false
    );

    xhr.upload.addEventListener(
      "load",
      () => {
        // set percentage to 100
        // remvoe progress bar
        console.log(`${file.name}: 100%`);
      },
      false
    );
    xhr.open(
      "POST",
      "http://demos.hacks.mozilla.org/paul/demos/resources/webservices/devnull.php"
    );
    // xhr.overrideMimeType("text/plain; charset=x-user-defined-binary");
    reader.onload = function (evt) {
      xhr.send(evt.target?.result);
    };
    reader.readAsBinaryString(file);
  }

  return (
    <div>
      <input
        type="file"
        id="fileElem"
        multiple
        accept="image/*"
        className="sr-only"
      />
      <p>{status}</p>
      <label htmlFor="fileElem" ref={dropRef}>
        Select some files
      </label>
      {fileList?.length ? (
        <ul>{files.map((file) => getImagePreview(file))}</ul>
      ) : null}
    </div>
  );
}

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const fileTypes = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/pjpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/webp",
  "image/x-icon",
];

function validFileType(file) {
  return fileTypes.includes(file.type);
}
