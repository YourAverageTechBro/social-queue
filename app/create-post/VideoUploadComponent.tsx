"use client";

import { ChangeEvent, memo, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import {
  CheckCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { Tables } from "@/types/supabase";
import Text from "@/components/common/Text";
import TextArea from "@/components/common/TextArea";
import { processSocialMediaPost } from "@/app/actions/socialMediaPosts";

const MemoizedMedia = memo(
  function Media({ file, onRemove }: { file: File; onRemove: () => void }) {
    return (
      <div className={"flex flex-col items-center gap-2 w-full"}>
        {file.type === "image/jpeg" ? (
          <img
            className="w-72 shadow-lg rounded-lg h-auto aspect-image my-8"
            src={URL.createObjectURL(file)}
            alt={file.name}
          />
        ) : (
          <video
            id="video"
            className="w-72 shadow-lg rounded-lg h-auto aspect-video my-8"
            src={URL.createObjectURL(file)}
            controls
          />
        )}
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
  const [files, setFiles] = useState<{ file: File; errorMessage: string }[]>(
    []
  );
  const [error, setError] = useState<string>("");
  const [successString, setSuccessString] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (fileInputRef.current?.files) {
      const files = fileInputRef.current?.files;
      for (let i = 0; i < files.length; i++) {
        const selectedFile = files[i];
        if (
          selectedFile.type === "video/mp4" ||
          selectedFile.type === "video/quicktime"
        ) {
          // Validate file size (1GB max)
          const maxSizeInBytes = 1024 * 1024 * 1024;
          if (selectedFile.size > maxSizeInBytes) {
            setFiles((prev) => [
              ...prev,
              {
                file: selectedFile,
                errorMessage: "File error: Video file size exceeds 1GB.",
              },
            ]);
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
                "File error: Video duration must be between 3 seconds and 15 minutes."
              );
            } else {
              setError("");
              setFiles((prev) => [
                ...prev,
                { file: selectedFile, errorMessage: "" },
              ]);
            }
          };
          video.src = URL.createObjectURL(selectedFile);
        } else if (selectedFile.type === "image/jpeg") {
          // Validate file size (8MB max)
          const maxSizeInBytes = 1024 * 1024 * 8;
          if (selectedFile.size > maxSizeInBytes) {
            setFiles((prev) => [
              ...prev,
              {
                file: selectedFile,
                errorMessage: "File error: Image file size exceeds 9MB.",
              },
            ]);
            return;
          }
          setFiles((prev) => [
            ...prev,
            { file: selectedFile, errorMessage: "" },
          ]);
        }
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
    <div className={"flex flex-col justify-center items-center w-full px-2"}>
      <div
        className={
          "flex justify-center items-center gap-2 flex-wrap w-full mb-4"
        }
      >
        {files.map(({ file, errorMessage }) => (
          <div>
            <MemoizedMedia
              file={file}
              onRemove={() =>
                setFiles((prev) => prev.filter((entry) => entry.file !== file))
              }
            />
            {errorMessage && (
              <div
                className={"bg-red-500 rounded-lg p-4 flex items-center gap-2"}
              >
                <XCircleIcon className={"h-6 w-6"} />
                <p className={""}>{errorMessage} </p>
              </div>
            )}
          </div>
        ))}
      </div>
      {files.length === 0 && (
        <div
          className="mb-4 border-2 border-gray-200 hover:border-orange-500 hover:cursor-pointer w-full md:w-1/2 h-48 rounded-lg flex items-center justify-center"
          onClick={handleCustomButtonClick}
        >
          <p className="text-gray-400">Click to add photos or videos</p>
        </div>
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
        <form
          action={(data) => {
            data.append("numberOfFiles", files.length.toString());
            files.forEach((file, index) => {
              data.append(`file${index}`, file.file);
            });

            processSocialMediaPost(data).then(({ error, data }) => {
              if (error) {
                setError(error);
              } else if (data) {
                setSuccessString(data);
              }
            });
          }}
          className={"flex flex-col justify-center"}
        >
          <input type={"hidden"} name={"userId"} value={userId} />
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            className={"hidden"}
            ref={fileInputRef}
            multiple
            name={"mediaFiles"}
            accept="video/mp4, video/quicktime, image/jpeg"
          />
          <input type={"hidden"} name={"numberOfFiles"} value={files.length} />
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
              files.length === 0 ||
              files.some((entry) => entry.errorMessage)
            }
            type={"submit"}
          >
            Upload Post
          </Button>
        </form>
        {error && (
          <div
            className={
              "bg-red-500 rounded-lg p-4 flex items-center gap-2 w-full"
            }
          >
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
