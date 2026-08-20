"use client";

import React, { useRef, useState } from "react";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import config from "@/lib/config";
import Image from "next/image";
import { FieldPath } from "react-hook-form";

import { toast } from "sonner"

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/imagekit-auth`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with status ${response.status} : ${errorText}`);
    }
    const data = await response.json();
    const { signature, token, expire } = data;
    return { token, expire, signature };
  } catch (error: any) {
    throw new Error(`Authentication request failed : ${error.message}`);
  }
};

const ImageUpload = ({ onFileChange }: { onFileChange: (FieldPath: string) => void;}) => {
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const ikUploadRef = useRef<HTMLInputElement>(null);

  // Equivalent of onError/onSuccess from IKUpload
  const onError = (error: unknown) => {
    console.error("Upload failed:", error);
    toast.error("Image upload failed. Please try again.");
  };

  const onSuccess = (res: { filePath: string }) => {
    console.log("Upload succeeded:", res);
    setFile({ filePath: res.filePath });
    onFileChange(res.filePath);
    toast.success("Image uploaded successfully");
  };

  const handleUpload = async () => {
    const fileInput = ikUploadRef.current;
    if (!fileInput?.files?.length) return;
    const selectedFile = fileInput.files[0];

    let authParams;
    try {
      authParams = await authenticator();
    } catch (authError) {
      onError(authError);
      return;
    }
    const { signature, expire, token } = authParams;

    try {
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file: selectedFile,
        fileName: "test-upload.png", // now a valid string
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
      });
      onSuccess(uploadResponse as { filePath: string });
    } catch (error) {
      if (
        error instanceof ImageKitAbortError ||
        error instanceof ImageKitInvalidRequestError ||
        error instanceof ImageKitUploadNetworkError ||
        error instanceof ImageKitServerError
      ) {
        onError(error);
      } else {
        onError(error);
      }
    }
  };

  return (
    <>
        <div className="hidden">
            <input
                type="file"
                className="hidden"
                ref={ikUploadRef}
                onChange={handleUpload}
            />
            <progress value={progress} max={100} />
            {file && <p>Uploaded to: {file.filePath}</p>}
        </div>
        <div>
            <button className="upload-btn" onClick={(e) => {
                e.preventDefault();
                ikUploadRef.current?.click();
            }}>
                <Image src="/icons/upload.svg" alt="Upload-Icon" width={20} height={20} className="object-contain" />
                <p className="text-base text-light-100">Upload a File</p>
            </button>

            {file && (
                <div className="mt-2">
                <Image
                    src={`${urlEndpoint}${file.filePath}`}
                    alt="Uploaded preview"
                    width={200}
                    height={200}
                    className="rounded-md object-cover"
                />
                </div>
            )}
        </div>
    </>
  );
};

export default ImageUpload;