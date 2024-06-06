"use client";

import { ChangeEvent, memo, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Tables } from "@/types/supabase";
import Text from "@/components/common/Text";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (fileInputRef.current?.files) {
      const files = fileInputRef.current?.files;
      if (files.length > 0) {
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
    <div className={"flex flex-col justify-center items-center"}>
      {file && (
        <MemoizedVideo file={file} onRemove={() => setFile(undefined)} />
      )}
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
      {!file && (
        <Button onClick={handleCustomButtonClick}> Add A Video To Post</Button>
      )}
      {file && instagramAccounts.length > 0 && (
        <div className={"flex flex-col justify-center"}>
          <div className={"flex flex-wrap items-center gap-2"}>
            {instagramAccounts.map((account) => (
              <button
                className={`p-4 rounded-lg border-white bg-gray-800 flex items-center gap-2 ${
                  selectedInstagramAccounts.find((acc) => acc.id === account.id)
                    ? "border-2 border-orange-500"
                    : "border-2 border-gray-800"
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
          <Button disabled={selectedInstagramAccounts.length === 0}>
            Upload Post
          </Button>
        </div>
      )}
    </div>
  );
}
