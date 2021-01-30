import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ProfileSettingsForm_UserFragment,
  useUpdateUserMutation,
} from "@app/graphql";
import { getExceptionFromError } from "@app/lib";
import { message, Upload } from "antd";
import { UploadChangeParam, UploadFile } from "antd/lib/upload/interface";
import axios from "axios";
import React, { useState } from "react";
import slugify from "slugify";

export function getUid(name: string) {
  const randomHex = () => Math.floor(Math.random() * 16777215).toString(16);
  const fileNameSlug = slugify(name);
  return randomHex() + "-" + fileNameSlug;
}

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
const ALLOWED_UPLOAD_CONTENT_TYPES_STRING = ALLOWED_UPLOAD_CONTENT_TYPES.join(
  ","
);

export function AvatarUpload({
  user,
}: {
  user: ProfileSettingsForm_UserFragment;
}) {
  const [updateUser] = useUpdateUserMutation();

  const beforeUpload = (file: any) => {
    const fileName = file.name.split(".")[0];
    const fileType = file.name.split(".")[1];
    file.uid = getUid(fileName) + "." + fileType;
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG or PNG images!");
      file.status = "error";
    }
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error("Image must smaller than 3MB!");
      file.status = "error";
    }
    return isJpgOrPng && isLt3M;
  };

  const [loading, setLoading] = useState(false);

  const customRequest = async (option: any) => {
    const { onSuccess, onError, file, onProgress } = option;
    try {
      const uploadUrl = await axios
        .get(`${process.env.ROOT_URL}/api/s3`, {
          params: {
            // @ts-ignore
            key: file.uid,
            operation: "put",
          },
        })
        .then((response) => {
          const preSignedUrl = response.data.url;
          return preSignedUrl;
        });

      if (!uploadUrl) {
        throw new Error("Failed to generate upload URL");
      }
      const response = await axios.put(uploadUrl, file, {
        onUploadProgress: (e) => {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress({ percent: progress }, file);
        },
      });
      if (response.config.url) {
        const previousAvatarUrl = user.avatarUrl;
        await updateUser({
          variables: {
            id: user.id,
            patch: {
              avatarUrl: response.config.url.split("?")[0],
            },
          },
        });
        if (previousAvatarUrl) {
          deleteUserAvatarFromBucket(previousAvatarUrl);
        }
        onSuccess(response.config, file);
      }
    } catch (e) {
      console.error(e);
      onError(e);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  const onChange = (info: UploadChangeParam<UploadFile<any>>) => {
    switch (info.file.status) {
      case "uploading": {
        setLoading(true);
        break;
      }
      case "removed":
      case "success": {
        setLoading(false);
        break;
      }
      case "error": {
        const error: any = getExceptionFromError(info.file.error);
        console.dir(error);
        message.error(
          typeof error === "string"
            ? error
            : error?.message ??
                "Unknown error occurred" +
                  (error?.code ? ` (${error.code})` : "")
        );
        setLoading(false);
        break;
      }
    }
  };

  const deleteUserAvatarFromBucket: (
    avatarUrl: string
  ) => Promise<Boolean> = async (avatarUrl) => {
    if (avatarUrl) {
      const key = decodeURIComponent(
        avatarUrl.substring(avatarUrl.lastIndexOf("/") + 1)
      );
      await axios
        .get(`${process.env.ROOT_URL}/api/s3`, {
          params: {
            key: `${key}`,
            operation: "delete",
          },
        })
        .then(() => {
          // console.log("deleted");
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
          return false;
        });
    }
    return true;
  };

  return (
    <div>
      <Upload
        accept={ALLOWED_UPLOAD_CONTENT_TYPES_STRING}
        name="avatar"
        listType="picture-card"
        showUploadList={false}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onChange={onChange}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="avatar" style={{ width: "100%" }} />
        ) : (
          uploadButton
        )}
      </Upload>
    </div>
  );
}
