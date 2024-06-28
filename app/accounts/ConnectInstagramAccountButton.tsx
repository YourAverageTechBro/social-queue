"use client";

import { Button } from "@/components/common/Button";
import Icons from "@/components/common/Icons";
import Modal from "@/components/common/Modal";
import { saveInstagramAccounts, loginToFacebook } from "@/utils/facebookSdk";
import { useLogger } from "next-axiom";
import Link from "next/link";
import { useState } from "react";

export default function ConnectInstagramAccountButton({
  userId,
}: {
  userId: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logger = useLogger();
  const facebookLoginCallback = (res: fb.StatusResponse) => {
    if (res.status === "connected") {
      const appScopedUserId = res.authResponse.userID;
      saveInstagramAccounts({
        appScopedUserId,
        logger,
        userId,
      });
    }
  };
  return (
    <>
      <button
        onClick={() => {
          setIsModalOpen(true);
        }}
        className="p-2 rounded-full flex items-center gap-2 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 text-white"
      >
        <Icons.instagram className="h-6 w-6 inline-block" />
        <p className="font-bold text-gray-100"> Connect Instagram Account</p>
      </button>
      <Modal open={isModalOpen} setOpen={setIsModalOpen}>
        <div>
          <h2 className="text-2xl font-bold">
            To connect your Instagram account to Social Queue, you need to have
            an Instagram business or creator account and it must be connected to
            a Facebook page.
          </h2>
          <p className="text-gray-200 mt-4">
            {" "}
            <span className="font-bold">
              This is a requirement from Instagram —
            </span>{" "}
            sorry, we know it is a little annoying 😞
          </p>
          <p className="text-gray-200 my-4">
            <Link
              href="https://yklabs.notion.site/How-To-Connect-Your-Instagram-Account-To-Social-Queue-5b01f47b2f704f14aebe748a326aa0d3?pvs=4"
              className="text-orange-500 font-bold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              We made a guide{" "}
            </Link>
            to help you set up your Instagram account so you can connect it to
            Social Queue.
          </p>

          <button
            onClick={() => {
              loginToFacebook(facebookLoginCallback, {
                scope:
                  "business_management,pages_show_list,instagram_basic,instagram_content_publish",
              });
            }}
            className="p-2 rounded-full flex items-center gap-2 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 text-white"
          >
            <Icons.instagram className="h-6 w-6 inline-block" />
            <p className="font-bold text-gray-100">
              {" "}
              Connect Instagram Account
            </p>
          </button>
        </div>
      </Modal>
    </>
  );
}
