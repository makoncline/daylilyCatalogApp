import { PlusOutlined } from "@ant-design/icons";
import {
  ProfileSettingsForm_UserFragment,
  useCreateUploadUrlMutation,
  useUpdateUserMutation,
} from "@app/graphql";
import { Upload } from "antd";
import { UploadFile, UploadProps } from "antd/lib/upload/interface";
import axios from "axios";
import { UploadRequestOption } from "rc-upload/lib/interface";
import React, { useState } from "react";

const ALLOWED_UPLOAD_CONTENT_TYPES = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/webp",
];
const accept = ALLOWED_UPLOAD_CONTENT_TYPES.join(",");

export function AvatarUpload({
  user,
  imgUrls,
}: {
  user: ProfileSettingsForm_UserFragment;
  imgUrls: string[];
}) {
  const [updateUser] = useUpdateUserMutation();
  const [createUploadUrl] = useCreateUploadUrlMutation();

  const defaulfFileList: UploadFile<any>[] = imgUrls
    .filter(Boolean)
    .map((imgUrl, i) => {
      return {
        uid: `imgUrl-${i}`,
        status: "done",
        url: imgUrl,
        size: 0,
        name: `imgUrl-${i}.png`,
        type: "image/*",
      };
    });
  const [fileList, setFileList] = useState<Array<UploadFile>>(defaulfFileList);

  async function customRequest(options: UploadRequestOption) {
    const { onProgress, onSuccess, onError, action, file } = options;
    if (onProgress && onSuccess && onError) {
      await axios
        .put(action, file, {
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            onProgress({
              ...progressEvent,
              percent: Math.round((loaded / total) * 100),
            });
          },
        })
        .then((response) => {
          onSuccess(response, response.request);
          return response;
        })
        .catch((err) => {
          onError(err);
        });
    }
  }

  async function action(file: UploadFile): Promise<string> {
    const contentType = file.type;
    console.log(
      "🚀 ~ file: AvatarUpload.tsx ~ line 149 ~ action ~ contentType",
      contentType
    );
    const { data: uploadUrlData } = await createUploadUrl({
      variables: {
        input: {
          contentType,
        },
      },
    });
    if (uploadUrlData?.createUploadUrl) {
      const { uploadUrl, url, key } = uploadUrlData.createUploadUrl;
      file.url = url;
      file.uid = key;
      return uploadUrl;
    } else {
      return "";
    }
  }

  async function onChange({
    file,
    fileList,
  }: {
    file: UploadFile;
    fileList: Array<UploadFile>;
  }) {
    console.log("🚀 ~ file: AvatarUpload.tsx ~ line 102 ~ fileList", fileList);
    setFileList(fileList);
    if (file.status === "removed") {
      await updateUser({
        variables: {
          id: user.id,
          patch: {
            avatarUrl: null,
          },
        },
      });
    } else if (file.status === "uploading") {
    } else if (file.status === "done") {
      console.log(
        "🚀 ~ file: AvatarUpload.tsx ~ line 191 ~ file.url",
        file.url
      );
      await updateUser({
        variables: {
          id: user.id,
          patch: {
            avatarUrl: file.url,
          },
        },
      });
    }
  }

  const props: UploadProps<any> = {
    action,
    accept,
    fileList,
    listType: "picture-card",
    onChange,
    customRequest,
  };
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  const max = 1;
  return (
    <div>
      <Upload {...props}>{fileList.length >= max ? null : uploadButton}</Upload>
    </div>
  );
}
