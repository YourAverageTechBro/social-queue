"use client";

import { ChangeEvent, memo, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import {
  CheckCircleIcon,
  InformationCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import Text from "@/components/common/Text";
import TextArea from "@/components/common/TextArea";
import {
  checkInstagramContainerStatus,
  createInstagramContainer,
  createSocialMediaPost,
  publishInstagramMediaContainer,
  saveInstagramId,
} from "@/app/actions/socialMediaPosts";
import Icons from "@/components/common/Icons";
import TextInput from "@/components/common/TextInput";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useLogger } from "next-axiom";
import { errorString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/client";
import {
  checkTikTokPublishStatus,
  PrivacyLevel,
  uploadTikTokPost,
  writeTikTokPostToSupabase,
} from "../actions/tiktok";
import Toggle from "@/components/common/Toggle";
import Selector, { SelectorOption } from "@/components/common/Selector";
import {
  TikTokAccountWithVideoRestrictions,
  InstagramAccountWithVideoRestrictions,
  YoutubeChannelWithVideoRestrictions,
} from "../actions/socialMediaAccounts";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";

const bucketName =
  process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET;

const privacyLevels: SelectorOption<PrivacyLevel>[] = [
  {
    name: "Public",
    value: "PUBLIC_TO_EVERYONE",
  },
  {
    name: "Only you",
    value: "SELF_ONLY",
  },
  {
    name: "Friends",
    value: "MUTUAL_FOLLOW_FRIENDS",
  },
  {
    name: "Followers",
    value: "FOLLOWER_OF_CREATOR",
  },
];

type ProcessingState =
  | "processing"
  | "posted"
  | "error"
  | "disabled"
  | "uploading";

const MemoizedMedia = memo(
  function Media({ file, onRemove }: { file: File; onRemove: () => void }) {
    return (
      <div className={"flex flex-col items-center gap-2 w-full"}>
        {file.type === "image/jpeg" ? (
          <img
            className="w-96 shadow-lg rounded-lg h-auto aspect-image my-8"
            src={URL.createObjectURL(file)}
            alt={file.name}
          />
        ) : (
          <video
            id="video"
            className="w-96 shadow-lg rounded-lg h-auto aspect-video my-8"
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
  tiktokAccounts,
  youtubeChannels,
  userId,
  isProUser,
}: {
  instagramAccounts: InstagramAccountWithVideoRestrictions[];
  tiktokAccounts: TikTokAccountWithVideoRestrictions[];
  youtubeChannels: YoutubeChannelWithVideoRestrictions[];
  userId: string;
  isProUser: boolean;
}) {
  const [disableDuet, setDisableDuet] = useState<boolean>(false);
  const [disableComment, setDisableComment] = useState<boolean>(false);
  const [disableStitch, setDisableStitch] = useState<boolean>(false);
  const [privateYoutube, setPrivateYoutube] = useState<boolean>(false);
  const [selectedInstagramAccounts, setSelectedInstagramAccounts] = useState<
    InstagramAccountWithVideoRestrictions[]
  >([]);
  const [selectedTiktokAccounts, setSelectedTiktokAccounts] = useState<
    TikTokAccountWithVideoRestrictions[]
  >([]);
  const [selectedYoutubeChannels, setSelectedYoutubeChannels] = useState<
    YoutubeChannelWithVideoRestrictions[]
  >([]);
  const [files, setFiles] = useState<File[]>([]);
  const [
    instagramAccountIdToProcessingState,
    setInstagramAccountIdToProcessingState,
  ] = useState<{
    [key: string]: { state: ProcessingState; message?: string };
  }>(
    instagramAccounts.reduce((acc, account) => {
      if (account.error) {
        acc[account.instagram_business_account_id] = {
          state: "disabled",
          message: account.error,
        };
      }
      return acc;
    }, {} as { [key: string]: { state: ProcessingState; message?: string } })
  );
  const [
    tiktokAccountIdToProcessingState,
    setTiktokAccountIdToProcessingState,
  ] = useState<{
    [key: string]: { state: ProcessingState; message?: string };
  }>(
    tiktokAccounts.reduce((acc, account) => {
      if (account.error) {
        acc[account.id] = { state: "disabled", message: account.error };
      }
      return acc;
    }, {} as { [key: string]: { state: ProcessingState; message?: string } })
  );
  const [
    youtubeChannelIdToProcessingState,
    setYoutubeChannelIdToProcessingState,
  ] = useState<{
    [key: string]: { state: ProcessingState; message?: string };
  }>(
    youtubeChannels.reduce((acc, channel) => {
      if (channel.error) {
        acc[channel.id] = { state: "disabled", message: channel.error };
      }
      return acc;
    }, {} as { [key: string]: { state: ProcessingState; message?: string } })
  );
  const [youtubeTitle, setYoutubeTitle] = useState<string>("");
  const [instagramCaption, setInstagramCaption] = useState<string>("");
  const [tiktokAutoAddMusicToPhotos, setTiktokAutoAddMusicToPhotos] =
    useState<boolean>(false);
  const [tiktokCaption, setTiktokCaption] = useState<string>("");
  const [tiktokShouldDiscloseContent, setTiktokShouldDiscloseContent] =
    useState<boolean>(false);
  const [tiktokIsYourBrandPromotion, setTiktokIsYourBrandPromotion] =
    useState<boolean>(false);
  const [tiktokIsBrandedContent, setTiktokIsBrandedContent] =
    useState<boolean>(false);
  const [tiktokPrivacyLevel, setTiktokPrivacyLevel] = useState<
    SelectorOption<PrivacyLevel>
  >({
    name: "Public",
    value: "PUBLIC_TO_EVERYONE",
  });
  const [tiktokTitle, setTiktokTitle] = useState<string>("");
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showTikTokAdditionalSettings, setShowTikTokAdditionalSettings] =
    useState<boolean>(false);
  let logger = useLogger().with({
    component: "VideoUploadComponent",
  });
  const supabase = createClient();
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

          // Validate file duration (3 seconds min, 15 minutes max)
          const video = document.createElement("video");
          video.preload = "metadata";
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            const duration = video.duration;
            disableSocialMediaAccountsIfNecessary({
              duration,
              videoSize: selectedFile.size,
            });
            setFiles((prev) => [...prev, selectedFile]);
          };
          video.src = URL.createObjectURL(selectedFile);
        }
      }
    }
  };

  const disableSocialMediaAccountsIfNecessary = ({
    duration,
    videoSize,
  }: {
    duration: number;
    videoSize: number;
  }) => {
    disableAccountsBasedOnVideoDuration(duration);
    disableAccountsBasedOnVideoSize(videoSize);
  };

  const disableAccountsBasedOnVideoDuration = (duration: number) => {
    const updatedTiktokAccountStates = {
      ...tiktokAccountIdToProcessingState,
    };
    tiktokAccounts.forEach((account) => {
      if (duration > account.max_video_duration) {
        updatedTiktokAccountStates[account.id] = {
          state: "disabled",
          message: `Cannot upload video longer than ${account.max_video_duration} seconds to this account`,
        };
      } else if (duration < account.min_video_duration) {
        updatedTiktokAccountStates[account.id] = {
          state: "disabled",
          message: `Cannot upload video shorter than ${account.max_video_duration} seconds to this account`,
        };
      }
    });
    setTiktokAccountIdToProcessingState(updatedTiktokAccountStates);

    const updatedInstagramAccountStates = {
      ...instagramAccountIdToProcessingState,
    };
    instagramAccounts.forEach((account) => {
      if (duration > account.max_video_duration) {
        updatedInstagramAccountStates[account.instagram_business_account_id] = {
          state: "disabled",
          message: `Cannot upload video longer than ${account.max_video_duration} seconds to this account`,
        };
      } else if (duration < account.min_video_duration) {
        updatedInstagramAccountStates[account.instagram_business_account_id] = {
          state: "disabled",
          message: `Cannot upload video shorter than ${account.min_video_duration} seconds to this account`,
        };
      }
    });
    setInstagramAccountIdToProcessingState(updatedInstagramAccountStates);

    const updatedYoutubeChannelStates = {
      ...youtubeChannelIdToProcessingState,
    };
    youtubeChannels.forEach((channel) => {
      if (duration > channel.max_video_duration) {
        updatedYoutubeChannelStates[channel.id] = {
          state: "disabled",
          message: `Cannot upload video longer than ${channel.max_video_duration} seconds to this channel`,
        };
      } else if (duration < channel.min_video_duration) {
        updatedYoutubeChannelStates[channel.id] = {
          state: "disabled",
          message: `Cannot upload video shorter than ${channel.min_video_duration} seconds to this channel`,
        };
      }
    });
    setYoutubeChannelIdToProcessingState(updatedYoutubeChannelStates);
  };

  const disableAccountsBasedOnVideoSize = (size: number) => {
    const updatedTiktokAccountStates = {
      ...tiktokAccountIdToProcessingState,
    };
    tiktokAccounts.forEach((account) => {
      if (size > account.max_video_size) {
        updatedTiktokAccountStates[account.id] = {
          state: "disabled",
          message: `Cannot upload videos larger than ${
            account.max_video_size / 1024 ** 3
          } GB to this account`,
        };
      }
    });
    setTiktokAccountIdToProcessingState(updatedTiktokAccountStates);

    const updatedInstagramAccountStates = {
      ...instagramAccountIdToProcessingState,
    };
    instagramAccounts.forEach((account) => {
      if (size > account.max_video_size) {
        updatedInstagramAccountStates[account.instagram_business_account_id] = {
          state: "disabled",
          message: `Cannot upload videos larger than ${
            account.max_video_size / 1024 ** 3
          } GB to this account`,
        };
      }
    });
    setInstagramAccountIdToProcessingState(updatedInstagramAccountStates);

    const updatedYoutubeChannelStates = {
      ...youtubeChannelIdToProcessingState,
    };
    youtubeChannels.forEach((channel) => {
      if (size > channel.max_video_size) {
        updatedYoutubeChannelStates[channel.id] = {
          state: "disabled",
          message: `Cannot upload videos larger than ${
            channel.max_video_size / 1024 ** 3
          } GB to this account`,
        };
      }
    });
    setYoutubeChannelIdToProcessingState(updatedYoutubeChannelStates);
  };

  const handleCustomButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processSocialMediaPost = () => {
    selectedInstagramAccounts.forEach((account) => {
      setInstagramAccountIdToProcessingState({
        [account.instagram_business_account_id]: {
          state: "uploading",
          message: "Uploading",
        },
      });
    });

    selectedTiktokAccounts.forEach((account) => {
      setTiktokAccountIdToProcessingState({
        [account.id]: {
          state: "uploading",
          message: "Uploading",
        },
      });
    });

    selectedYoutubeChannels.forEach((channel) => {
      setYoutubeChannelIdToProcessingState({
        [channel.id]: {
          state: "uploading",
          message: "Uploading",
        },
      });
    });
    createSocialMediaPost(userId).then(async (socialMediaPostId) => {
      processSingleSocialMediaPost({ socialMediaPostId });
    });
  };

  const uploadSocialMediaPostFile = async ({
    userId,
    file,
    index,
    postId,
  }: {
    userId: string;
    file: File;
    index: number;
    postId: string;
  }) => {
    logger = logger.with({
      function: "uploadSocialMediaPostFile",
      userId,
    });

    if (!bucketName) {
      logger.error(errorString, {
        error: "No bucket name found in environment variables",
      });
      await logger.flush();
      throw Error("Sorry, something went wrong. The team is looking into it.");
    }

    const filePath = `${userId}/${postId}/${index}.${
      file.name.split(".").pop() ?? file.name
    }`;

    // Upload file
    const { data: uploadResponse, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      logger.error(errorString, uploadError);
      console.error(uploadError);
      throw uploadError;
    }
    if (!uploadResponse?.path) {
      logger.error(errorString, {
        error: "No file path found in response from Supabase",
      });
      console.error("No file path found in response from Supabase");
      throw new Error("No file path found in response from Supabase");
    }

    const { error: insertError } = await supabase
      .from("social-media-post-media-files")
      .insert({
        media_file_path: uploadResponse.path,
        parent_social_media_post_id: postId,
        user_id: userId,
      });

    if (insertError) {
      logger.error(errorString, insertError);
      console.error(insertError);
      throw insertError;
    }

    logger.info("Social media post file uploaded", { file: file.name });
    return uploadResponse.path;
  };

  const processSingleSocialMediaPost = async ({
    socialMediaPostId,
  }: {
    socialMediaPostId: string;
  }) => {
    const file = files[0];
    let filePath = "";
    try {
      filePath = await uploadSocialMediaPostFile({
        userId,
        file,
        index: 0,
        postId: socialMediaPostId,
      });
    } catch (error) {
      selectedInstagramAccounts.forEach((account) => {
        setInstagramAccountIdToProcessingState({
          [account.instagram_business_account_id]: {
            state: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        });
      });
    }
    if (filePath) {
      selectedInstagramAccounts.forEach((account) => {
        setInstagramAccountIdToProcessingState({
          [account.instagram_business_account_id]: {
            state: "processing",
            message: "Processing",
          },
        });
        const caption = showWatermark
          ? `${instagramCaption} — posted from SocialQueue.ai`
          : instagramCaption;
        createInstagramContainer({
          instagramBusinessAccountId: account.instagram_business_account_id,
          filePath,
          caption,
          userId,
          postType: file.type.includes("video") ? "video" : "image",
          isCarouselItem: false,
        })
          .then((containerId) =>
            checkInstagramContainerStatus({
              containerIds: [containerId],
              instagramBusinessAccountId: account.instagram_business_account_id,
              userId,
            }).then(() => {
              publishInstagramMediaContainer({
                instagramMediaContainerId: containerId,
                instagramBusinessAccountId:
                  account.instagram_business_account_id,
                userId,
              }).then((instagramMediaId) => {
                saveInstagramId({
                  instagramMediaId,
                  parentSocialMediaPostId: socialMediaPostId,
                  caption: `${instagramCaption} — posted from SocialQueue.ai`,
                  userId,
                  instagramAccountId: account.id,
                });
                setInstagramAccountIdToProcessingState({
                  [account.instagram_business_account_id]: {
                    state: "posted",
                    message: "Posted",
                  },
                });
              });
            })
          )
          .catch((error) => {
            setInstagramAccountIdToProcessingState({
              [account.instagram_business_account_id]: {
                state: "error",
                message:
                  error instanceof Error ? error.message : "Unknown error",
              },
            });
          });
      });
      selectedTiktokAccounts.forEach((account) => {
        setTiktokAccountIdToProcessingState({
          [account.id]: {
            state: "processing",
            message: "Processing",
          },
        });
        const caption = showWatermark
          ? `${tiktokCaption} — posted from SocialQueue.ai`
          : tiktokCaption;
        uploadTikTokPost({
          userId,
          caption,
          autoAddMusic: tiktokAutoAddMusicToPhotos,
          brandOrganicToggle: tiktokIsYourBrandPromotion,
          brandContentToggle: tiktokIsBrandedContent,
          accessToken: account.access_token,
          filePath,
          privacyLevel: tiktokPrivacyLevel.value,
          disableDuet,
          disableComment,
          disableStitch,
          videoCoverTimestamp: 0,
          postType: file.type.includes("video") ? "video" : "image",
        }).then((publishId) =>
          checkTikTokPublishStatus({
            publishIds: [publishId],
            accessToken: account.access_token,
          }).then(() => {
            writeTikTokPostToSupabase({
              userId,
              caption,
              publishId,
              privacyLevel: "SELF_ONLY",
              disableDuet,
              disableComment,
              videoCoverTimestamp: 0,
              parentSocialMediaPostId: socialMediaPostId,
              tiktokAccountId: account.id,
            });
            setTiktokAccountIdToProcessingState({
              [account.id]: {
                state: "posted",
                message: "Posted",
              },
            });
          })
        );
      });
      selectedYoutubeChannels.forEach((channel) => {
        setYoutubeChannelIdToProcessingState({
          [channel.id]: {
            state: "processing",
            message: "Processing",
          },
        });
        const formData = new FormData();
        const title = showWatermark
          ? `${youtubeTitle} — posted from SocialQueue.ai`
          : youtubeTitle;
        formData.append("youtubeChannelId", channel.id);
        formData.append("videoPath", filePath);
        formData.append("title", title);
        formData.append("userId", userId);
        formData.append("parentSocialMediaPostId", socialMediaPostId);
        formData.append("isPrivate", privateYoutube.toString());
        fetch("/api/youtube/post", {
          method: "POST",
          body: formData,
        })
          .then((resp) => {
            if (resp.ok) {
              setYoutubeChannelIdToProcessingState({
                [channel.id]: {
                  state: "posted",
                  message: "Posted",
                },
              });
            } else {
              resp.json().then((data: { message: string }) => {
                setYoutubeChannelIdToProcessingState({
                  [channel.id]: {
                    state: "error",
                    message: data.message,
                  },
                });
              });
            }
          })
          .catch((error) => {
            logger.error(errorString, {
              error: error instanceof Error ? error.message : error,
            });
            setYoutubeChannelIdToProcessingState({
              [channel.id]: {
                state: "error",
                message:
                  error instanceof Error ? error.message : "Unknown error",
              },
            });
          });
      });
    }
  };

  const containsPhotos = files.some((file) => file.type.includes("image"));

  return (
    <div className={"flex flex-col justify-center items-center w-full px-2"}>
      <div
        className={
          "flex justify-center items-center gap-2 flex-wrap w-full mb-4"
        }
      >
        {files.map((file) => (
          <div>
            <MemoizedMedia
              file={file}
              onRemove={() =>
                setFiles((prev) => prev.filter((entry) => entry !== file))
              }
            />
          </div>
        ))}
      </div>
      {files.length === 0 && (
        <div
          className="mb-4 border-2 border-gray-200 hover:border-orange-500 hover:cursor-pointer w-full h-48 rounded-lg flex items-center justify-center"
          onClick={handleCustomButtonClick}
        >
          <p className="text-gray-400">Click to add photos or videos</p>
        </div>
      )}
      <div className={"flex flex-col justify-center w-full"}>
        <div className={"flex flex-wrap justify-center items-center gap-2"}>
          {instagramAccounts.map((account) => (
            <button
              className={`p-4 rounded-lg bg-secondaryBackground-light dark:bg-secondaryBackground-dark flex flex-col justify-center items-center gap-2 ${
                selectedInstagramAccounts.find(
                  (acc) =>
                    acc.instagram_business_account_id ===
                    account.instagram_business_account_id
                ) && "border-2 border-orange-500"
              } disabled:opacity-50 min-h-32`}
              disabled={
                instagramAccountIdToProcessingState[
                  account.instagram_business_account_id
                ]?.state === "disabled"
              }
              onClick={() =>
                setSelectedInstagramAccounts((prev) => {
                  if (
                    prev.find(
                      (acc) =>
                        acc.instagram_business_account_id ===
                        account.instagram_business_account_id
                    )
                  ) {
                    return prev.filter(
                      (acc) =>
                        acc.instagram_business_account_id !==
                        account.instagram_business_account_id
                    );
                  }
                  return [...prev, account];
                })
              }
              key={account.instagram_business_account_id}
            >
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <img
                    src={account.picture_file_path}
                    alt={account.account_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <Icons.instagram className="absolute bottom-[-8px] right-[-8px] w-6 h-6 rounded-full" />
                </div>
                <Text text={account.account_name} />
              </div>
              <div className="text-sm mt-1 flex items-center gap-2 justify-between w-full">
                <p
                  className={`
                  ${
                    instagramAccountIdToProcessingState[
                      account.instagram_business_account_id
                    ]?.state === "posted" && "text-green-400"
                  }
                  ${
                    instagramAccountIdToProcessingState[
                      account.instagram_business_account_id
                    ]?.state === "error" && "text-red-400"
                  }
                  ${
                    instagramAccountIdToProcessingState[
                      account.instagram_business_account_id
                    ]?.state === "processing" && "text-orange-400"
                  }
                `}
                >
                  {`${
                    instagramAccountIdToProcessingState[
                      account.instagram_business_account_id
                    ]?.message ?? ""
                  }`}
                </p>
                {(instagramAccountIdToProcessingState[
                  account.instagram_business_account_id
                ]?.state === "processing" ||
                  instagramAccountIdToProcessingState[
                    account.instagram_business_account_id
                  ]?.state === "uploading") && (
                  <LoadingSpinner size="h-6 w-6" />
                )}
                {instagramAccountIdToProcessingState[
                  account.instagram_business_account_id
                ]?.state === "error" && (
                  <XCircleIcon className="h-6 w-6 text-red-4000" />
                )}
                {instagramAccountIdToProcessingState[
                  account.instagram_business_account_id
                ]?.state === "posted" && (
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                )}
              </div>
            </button>
          ))}
          {tiktokAccounts.map((account) => (
            <button
              className={`p-4 rounded-lg bg-secondaryBackground-light dark:bg-secondaryBackground-dark flex flex-col justify-center items-center gap-2 ${
                selectedTiktokAccounts.find((acc) => acc.id === account.id) &&
                "border-2 border-orange-500"
              } disabled:opacity-50 min-h-32`}
              disabled={
                tiktokAccountIdToProcessingState[account.id]?.state ===
                "disabled"
              }
              onClick={() =>
                setSelectedTiktokAccounts((prev) => {
                  if (prev.find((acc) => acc.id === account.id)) {
                    return prev.filter((acc) => acc.id !== account.id);
                  }
                  return [...prev, account];
                })
              }
              key={account.id}
            >
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <img
                    src={account.profile_picture_file_path}
                    alt={account.account_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <Icons.tiktok className="absolute bottom-[-8px] right-[-8px] w-6 h-6 rounded-full" />
                </div>
                <Text text={account.account_name} />
              </div>
              <div className="text-sm mt-1 flex items-center gap-2 justify-between w-full">
                <p
                  className={`
                  ${
                    tiktokAccountIdToProcessingState[account.id]?.state ===
                      "posted" && "text-green-400"
                  }
                  ${
                    tiktokAccountIdToProcessingState[account.id]?.state ===
                      "error" && "text-red-400"
                  }
                  ${
                    tiktokAccountIdToProcessingState[account.id]?.state ===
                      "processing" && "text-orange-400"
                  }
                `}
                >
                  {`${
                    tiktokAccountIdToProcessingState[account.id]?.message ?? ""
                  }`}
                </p>
                {(tiktokAccountIdToProcessingState[account.id]?.state ===
                  "processing" ||
                  tiktokAccountIdToProcessingState[account.id]?.state ===
                    "uploading") && <LoadingSpinner size="h-6 w-6" />}
                {tiktokAccountIdToProcessingState[account.id]?.state ===
                  "error" && <XCircleIcon className="h-6 w-6 text-red-4000" />}
                {tiktokAccountIdToProcessingState[account.id]?.state ===
                  "posted" && (
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                )}
              </div>
            </button>
          ))}
          {youtubeChannels.map((channel) => (
            <button
              className={`p-4 rounded-lg bg-secondaryBackground-light dark:bg-secondaryBackground-dark flex flex-col justify-center items-center gap-2 ${
                selectedYoutubeChannels.find((ch) => ch.id === channel.id) &&
                "border-2 border-orange-500"
              } disabled:opacity-50 min-h-32`}
              disabled={
                youtubeChannelIdToProcessingState[channel.id]?.state ===
                "disabled"
              }
              onClick={() =>
                setSelectedYoutubeChannels((prev) => {
                  if (prev.find((acc) => acc.id === channel.id)) {
                    return prev.filter((acc) => acc.id !== channel.id);
                  }
                  return [...prev, channel];
                })
              }
              key={channel.id}
            >
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <img
                    src={channel.profile_picture_path}
                    alt={channel.channel_custom_url}
                    className="w-8 h-8 rounded-full"
                  />
                  <Icons.youtube className="absolute bottom-[-8px] right-[-8px] w-6 h-6 rounded-full" />
                </div>
                <Text text={channel.channel_custom_url} />
              </div>
              <div className="text-sm mt-1 flex items-center gap-2 justify-between w-full">
                <p
                  className={`
                  ${
                    youtubeChannelIdToProcessingState[channel.id]?.state ===
                      "posted" && "text-green-400"
                  }
                  ${
                    youtubeChannelIdToProcessingState[channel.id]?.state ===
                      "error" && "text-red-400"
                  }
                  ${
                    youtubeChannelIdToProcessingState[channel.id]?.state ===
                      "processing" && "text-orange-400"
                  }
                `}
                >
                  {`${
                    youtubeChannelIdToProcessingState[channel.id]?.message ?? ""
                  }`}
                </p>
                {(youtubeChannelIdToProcessingState[channel.id]?.state ===
                  "processing" ||
                  youtubeChannelIdToProcessingState[channel.id]?.state ===
                    "uploading") && <LoadingSpinner size="h-6 w-6" />}
                {youtubeChannelIdToProcessingState[channel.id]?.state ===
                  "error" && <XCircleIcon className="h-6 w-6 text-red-400" />}
                {youtubeChannelIdToProcessingState[channel.id]?.state ===
                  "posted" && (
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                )}
              </div>
            </button>
          ))}
        </div>
        <form
          action={processSocialMediaPost}
          className={"flex flex-col justify-center items-center"}
        >
          <input type={"hidden"} name={"userId"} value={userId} />
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            className={"hidden"}
            ref={fileInputRef}
            multiple={false}
            name={"mediaFiles"}
            accept="video/mp4, video/quicktime"
          />
          {selectedInstagramAccounts.length > 0 && (
            <div className="flex flex-col items-start gap-2 w-full">
              <Text
                alignment={"left"}
                intent="title"
                text="Instagram Settings"
                additionalStyles="mt-4"
              />
              <TextArea
                title={"Caption"}
                name={"instagramCaption"}
                placeholder={
                  "Check out thecontentmarketingblueprint.com for help with social media marketing!"
                }
                value={instagramCaption}
                setValue={setInstagramCaption}
              />
            </div>
          )}
          {selectedYoutubeChannels.length > 0 && (
            <div className="flex flex-col items-start gap-2 w-full">
              <Text
                alignment={"left"}
                intent="title"
                text="Youtube Settings"
                additionalStyles="mt-4"
              />
              <TextInput
                name={"youtubeTitle"}
                title={"Youtube Title"}
                placeholder={
                  "Check out thecontentmarketingblueprint.com for help with social media marketing!"
                }
                required={true}
                maxLength={70}
                type={"text"}
                value={youtubeTitle}
                setValue={setYoutubeTitle}
              />
              <Toggle
                enabled={privateYoutube}
                setEnabled={setPrivateYoutube}
                label="Private Youtube Video"
              />
            </div>
          )}
          {selectedTiktokAccounts.length > 0 && (
            <div className="flex flex-col items-start gap-2 w-full">
              <Text
                alignment={"left"}
                intent="title"
                text="TikTok Settings"
                additionalStyles="mt-4"
              />
              {containsPhotos && (
                <TextInput
                  title={"TikTok Photo Title"}
                  name={"tiktokTitle"}
                  placeholder={
                    "Check out thecontentmarketingblueprint.com for help with social media marketing!"
                  }
                  value={tiktokTitle}
                  setValue={setTiktokTitle}
                  required={true}
                  maxLength={90}
                  type="text"
                />
              )}
              <TextArea
                title={"Caption"}
                name={"tiktokCaption"}
                placeholder={
                  "Check out thecontentmarketingblueprint.com for help with social media marketing!"
                }
                value={tiktokCaption}
                setValue={setTiktokCaption}
              />
              <Selector
                title="Who can see this post"
                options={privacyLevels}
                selected={tiktokPrivacyLevel}
                setSelected={setTiktokPrivacyLevel}
                styleOverride="w-full"
              />

              <div className="flex items-center justify-between w-full">
                <Text intent="subtitle" text="Additional TikTok Settings" />
                <ChevronDownIcon
                  className={`h-6 w-6 ${
                    showTikTokAdditionalSettings ? "rotate-180" : ""
                  }`}
                  onClick={() =>
                    setShowTikTokAdditionalSettings(
                      !showTikTokAdditionalSettings
                    )
                  }
                />
              </div>
              {showTikTokAdditionalSettings && (
                <>
                  {!containsPhotos && (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <Text intent="subtitle" text="Disable Duet" />
                        <Toggle
                          enabled={disableDuet}
                          setEnabled={setDisableDuet}
                        />
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <Text intent="subtitle" text="Disable Stitch" />
                        <Toggle
                          enabled={disableStitch}
                          setEnabled={setDisableStitch}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between w-full">
                    <Text intent="subtitle" text="Disable Comments" />
                    <Toggle
                      enabled={disableComment}
                      setEnabled={setDisableComment}
                    />
                  </div>

                  {containsPhotos && (
                    <div className="flex items-center justify-between w-full">
                      <Text intent="subtitle" text="Auto Add Music" />
                      <Toggle
                        enabled={tiktokAutoAddMusicToPhotos}
                        setEnabled={setTiktokAutoAddMusicToPhotos}
                      />
                    </div>
                  )}

                  <div className="w-full flex flex-col gap-2">
                    <div className="flex items-center justify-between w-full">
                      <Text intent="subtitle" text="Disclose Video Content" />
                      <Toggle
                        enabled={tiktokShouldDiscloseContent}
                        setEnabled={setTiktokShouldDiscloseContent}
                      />
                    </div>
                    {tiktokShouldDiscloseContent && (
                      <div className="rounded-lg p-4 bg-orange-400 flex items-center gap-2">
                        <InformationCircleIcon className="h-6 w-6 text-white" />
                        <Text text='Your video will be labeled "Promotional Content". This cannot be changed once your video is posted.' />
                      </div>
                    )}
                    <Text
                      alignment={"left"}
                      text="Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both."
                    />
                  </div>
                  {tiktokShouldDiscloseContent && (
                    <>
                      <div className="w-full flex flex-col gap-2">
                        <div className="flex items-center justify-between w-full">
                          <Text intent="subtitle" text="Your Brand" />
                          <Toggle
                            enabled={tiktokIsYourBrandPromotion}
                            setEnabled={setTiktokIsYourBrandPromotion}
                          />
                        </div>
                        <Text
                          alignment={"left"}
                          text="You are promoting yourself or your own business. This video will be classified as Business Organic."
                        />
                      </div>

                      <div className="w-full flex flex-col gap-2">
                        <div className="flex items-center justify-between w-full">
                          <Text intent="subtitle" text="Branded Content" />
                          <Toggle
                            enabled={tiktokIsBrandedContent}
                            setEnabled={setTiktokIsBrandedContent}
                          />
                        </div>
                        <Text
                          alignment={"left"}
                          text="You are promoting another brand or a third party. This video will be classified as Branded Content."
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <p className="text-md">
                {" "}
                By posting, you agree to{" "}
                <a
                  className="underline text-orange-600"
                  href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                >
                  {" "}
                  TikTok's Music Usage Confirmation.{" "}
                </a>
              </p>
            </div>
          )}
          <div className="flex items-center justify-between w-full">
            <Toggle
              label="Post with watermark"
              enabled={showWatermark}
              setEnabled={setShowWatermark}
              toolTipId="show-watermark"
              toolTipString={`On a free account all posts will be posted with "posted from SocialQueue.ai" added to the end of your caption or title.
              tou can turn off the watermark by upgrading to a paid account.`}
              disabled={!isProUser}
            />
            <Button
              disabled={
                (selectedInstagramAccounts.length === 0 &&
                  selectedYoutubeChannels.length === 0 &&
                  selectedTiktokAccounts.length === 0) ||
                files.length === 0 ||
                (selectedYoutubeChannels.length > 0 &&
                  youtubeTitle.length === 0) ||
                (selectedYoutubeChannels.length > 0 &&
                  youtubeTitle.length > 100) ||
                Object.values(instagramAccountIdToProcessingState).some(
                  (state) => state.state === "processing"
                ) ||
                Object.values(youtubeChannelIdToProcessingState).some(
                  (state) => state.state === "processing"
                ) ||
                Object.values(tiktokAccountIdToProcessingState).some(
                  (state) => state.state === "processing"
                )
              }
              type={"submit"}
            >
              Upload Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
