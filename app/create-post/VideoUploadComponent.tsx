"use client";

import { ChangeEvent, memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import {
  CheckCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { Tables } from "@/types/supabase";
import Text from "@/components/common/Text";
import TextArea from "@/components/common/TextArea";
import { useFormState } from "react-dom";
import { uploadSocialMediaPost } from "@/app/actions/socialMediaPosts";

const MemoizedVideo = memo(
  function Video({ file, onRemove }: { file: File; onRemove: () => void }) {
    return (
      <div className={"flex items-center gap-2"}>
        <video
          id="video"
          className="w-full shadow-lg rounded-lg h-auto aspect-video my-8"
          src={URL.createObjectURL(file)}
          controls
        />
        <button onClick={onRemove}>
          <TrashIcon className="h-6 w-6 text-gray-400" />
        </button>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.file === nextProps.file
);

export default function VideoUploadComponent({
  instagramAccounts,
  userId,
}: {
  instagramAccounts: Tables<"instagram-accounts">[];
  userId: string;
}) {
  const [selectedInstagramAccounts, setSelectedInstagramAccounts] = useState<
    Tables<"instagram-accounts">[]
  >([]);
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<string>("");
  const [successString, setSuccessString] = useState<string>("");
  const [state, formAction] = useFormState(uploadSocialMediaPost, {
    error: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (state.error) {
      setError(state.error);
    }
    if (state.data) {
      setSuccessString(state.data);
    }
  }, [state]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (fileInputRef.current?.files) {
      const files = fileInputRef.current?.files;
      if (files.length > 0) {
        const selectedFile = files[0];

        // Validate file size (1GB max)
        const maxSizeInBytes = 1 * 1024 * 1024 * 1024;
        if (selectedFile.size > maxSizeInBytes) {
          setError("File size exceeds 1GB.");
          return;
        }

        // Validate file duration (3 seconds min, 15 minutes max)
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const duration = video.duration;
          if (duration < 3 || duration > 15 * 60) {
            setError(
              "Video duration must be between 3 seconds and 15 minutes."
            );
          } else {
            setError("");
            setFile(selectedFile);
          }
        };
        video.src = URL.createObjectURL(selectedFile);
        setFile(files[0]);
      }
    }
  };

  const handleCustomButtonClick = () => {
    // Trigger the hidden file input when the custom button is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return (
    <div className={"flex flex-col justify-center items-center w-full"}>
      {file && (
        <MemoizedVideo file={file} onRemove={() => setFile(undefined)} />
      )}
      {!file && (
        <Button onClick={handleCustomButtonClick}> Add A Video To Post</Button>
      )}
      <div className={"flex flex-col justify-center w-full md:w-1/2"}>
        <div className={"flex flex-wrap justify-center items-center gap-2"}>
          {instagramAccounts.map((account) => (
            <button
              className={`p-4 rounded-lg bg-gray-800 flex items-center gap-2 ${
                selectedInstagramAccounts.find(
                  (acc) => acc.id === account.id
                ) && "border-2 border-orange-500"
              }`}
              onClick={() => {
                setSelectedInstagramAccounts((prev) => {
                  if (prev.find((acc) => acc.id === account.id)) {
                    return prev.filter((acc) => acc.id !== account.id);
                  }
                  return [...prev, account];
                });
              }}
              key={account.id}
            >
              <img
                src={account.picture_url}
                alt={account.account_name}
                className={"w-8 h-8 rounded-full"}
              />
              <Text text={account.account_name} />
            </button>
          ))}
        </div>
        <form action={formAction} className={"flex flex-col justify-center"}>
          <input type={"hidden"} name={"userId"} value={userId} />
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            className={"hidden"}
            ref={fileInputRef}
            multiple={false}
            name={"mediaFile"}
            accept="video/*"
          />
          <input
            type={"hidden"}
            name={"instagramBusinessAccountIds"}
            value={selectedInstagramAccounts
              .map((entry) => entry.instagram_business_account_id)
              .join(",")}
          />

          <TextArea
            title={"Caption"}
            name={"caption"}
            placeholder={
              "Check out thecontentmarketingblueprint.com for help with social media marketing!"
            }
          />
          <Button
            disabled={
              selectedInstagramAccounts.length === 0 ||
              error.length > 0 ||
              !file
            }
            type={"submit"}
          >
            Upload Post
          </Button>
        </form>
        {error && (
          <div className={"bg-red-500 rounded-lg p-4 flex items-center gap-2"}>
            <XCircleIcon className={"h-6 w-6"} />
            <p className={""}>{error} </p>
          </div>
        )}

        {successString && (
          <div
            className={"bg-green-500 rounded-lg p-4 flex items-center gap-2"}
          >
            <CheckCircleIcon className={"h-6 w-6"} />
            <p className={""}>{successString} </p>
          </div>
        )}
      </div>
    </div>
  );
}
