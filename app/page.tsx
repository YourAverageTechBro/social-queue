"use client";

import { IconProps } from "@radix-ui/react-icons/dist/types";
import React, { forwardRef, useRef } from "react";
import { cn } from "@/utils/utils";
import { AnimatedBeam } from "@/components/common/AnimatedBeam";
import { Button } from "@/components/common/Button";
import Text from "@/components/common/Text";

export default function SocialQueue() {
  return (
    <div>
      <div className={"flex items-center gap-2 flex-col md:flex-row"}>
        <div
          className={
            "flex flex-col justify-center items-center md:items-start gap-4"
          }
        >
          <h1 className={"font-bold text-4xl text-center md:text-left"}>
            Upload Once, Post Everywhere
          </h1>
          <Text
            alignment={"left"}
            intent={"subtitle"}
            text={"Social media management for everyone"}
          />
          <Button href={"/login"}> Get Started </Button>
        </div>
        <AnimatedBeamMultipleOutputDemo />
      </div>
    </div>
  );
}

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

const AnimatedBeamMultipleOutputDemo = ({
  className,
}: {
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg bg-background p-10 md:shadow-xl",
        className
      )}
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <Icons.user className="text-black" />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref} className="h-16 w-16">
            <Icons.socialqueue className="h-6 w-6" />
          </Circle>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref}>
            <Icons.instagram className="h-6 w-6" />
          </Circle>
          <Circle ref={div2Ref}>
            <Icons.tiktok className="h-6 w-6" />
          </Circle>
          <Circle ref={div3Ref}>
            <Icons.youtube className="h-6 w-6" />
          </Circle>
        </div>
      </div>

      {/* AnimatedBeams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
        duration={3}
      />
    </div>
  );
};

const Icons = {
  socialqueue: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="500"
      zoomAndPan="magnify"
      viewBox="0 0 375 374.999991"
      height="500"
      preserveAspectRatio="xMidYMid meet"
      version="1.0"
      {...props}
    >
      <defs>
        <g />
        <clipPath id="ed164e4bb3">
          <path
            d="M 187.5 0 C 83.945312 0 0 83.945312 0 187.5 C 0 291.054688 83.945312 375 187.5 375 C 291.054688 375 375 291.054688 375 187.5 C 375 83.945312 291.054688 0 187.5 0 Z M 187.5 0 "
            clipRule="nonzero"
          />
        </clipPath>
      </defs>
      <g clipPath="url(#ed164e4bb3)">
        <rect
          x="-37.5"
          width="450"
          fill="#dd6b20"
          y="-37.499999"
          height="449.999989"
          fillOpacity="1"
        />
      </g>
      <g fill="#ffffff" fillOpacity="1">
        <g transform="translate(102.708982, 280.752507)">
          <g>
            <path d="M 86.3125 -149.859375 C 105.925781 -149.859375 122.53125 -146.019531 136.125 -138.34375 C 149.726562 -130.664062 156.53125 -118.78125 156.53125 -102.6875 L 105.1875 -102.6875 C 105.1875 -108.050781 102.78125 -111.84375 97.96875 -114.0625 C 94.632812 -115.914062 90.472656 -116.84375 85.484375 -116.84375 C 72.160156 -116.84375 65.5 -113.695312 65.5 -107.40625 C 65.5 -103.882812 67.8125 -101.382812 72.4375 -99.90625 C 77.0625 -98.425781 84.644531 -96.851562 95.1875 -95.1875 C 108.144531 -93.34375 118.96875 -91.171875 127.65625 -88.671875 C 136.351562 -86.171875 143.941406 -81.726562 150.421875 -75.34375 C 156.898438 -68.96875 160.140625 -60.039062 160.140625 -48.5625 C 160.140625 -29.875 153.15625 -16.550781 139.1875 -8.59375 C 125.21875 -0.644531 106.945312 3.328125 84.375 3.328125 C 71.414062 3.328125 59.203125 1.523438 47.734375 -2.078125 C 36.265625 -5.691406 26.921875 -11.289062 19.703125 -18.875 C 12.484375 -26.457031 8.875 -36.078125 8.875 -47.734375 L 60.21875 -47.734375 L 60.21875 -46.625 C 60.40625 -40.332031 63.039062 -35.9375 68.125 -33.4375 C 73.21875 -30.945312 78.632812 -29.703125 84.375 -29.703125 C 99.726562 -29.703125 107.40625 -33.304688 107.40625 -40.515625 C 107.40625 -44.210938 105 -46.894531 100.1875 -48.5625 C 95.375 -50.226562 87.507812 -51.988281 76.59375 -53.84375 C 63.457031 -56.0625 52.679688 -58.460938 44.265625 -61.046875 C 35.847656 -63.640625 28.492188 -68.035156 22.203125 -74.234375 C 15.910156 -80.429688 12.765625 -89.082031 12.765625 -100.1875 C 12.765625 -118.132812 19.5625 -130.898438 33.15625 -138.484375 C 46.757812 -146.066406 64.476562 -149.859375 86.3125 -149.859375 Z M 86.3125 -149.859375 " />
          </g>
        </g>
      </g>
    </svg>
  ),
  user: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-user"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  instagram: (props: IconProps) => (
    <svg
      width="800px"
      height="800px"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="24" cy="24" r="20" fill="#C13584" />
      <path
        d="M24 14.1622C27.2041 14.1622 27.5837 14.1744 28.849 14.2321C30.019 14.2855 30.6544 14.481 31.0773 14.6453C31.6374 14.863 32.0371 15.123 32.457 15.5429C32.877 15.9629 33.137 16.3626 33.3547 16.9227C33.519 17.3456 33.7145 17.981 33.7679 19.1509C33.8256 20.4163 33.8378 20.7958 33.8378 23.9999C33.8378 27.2041 33.8256 27.5836 33.7679 28.849C33.7145 30.019 33.519 30.6543 33.3547 31.0772C33.137 31.6373 32.877 32.0371 32.4571 32.457C32.0371 32.8769 31.6374 33.1369 31.0773 33.3546C30.6544 33.519 30.019 33.7144 28.849 33.7678C27.5839 33.8255 27.2044 33.8378 24 33.8378C20.7956 33.8378 20.4162 33.8255 19.151 33.7678C17.981 33.7144 17.3456 33.519 16.9227 33.3546C16.3626 33.1369 15.9629 32.8769 15.543 32.457C15.1231 32.0371 14.863 31.6373 14.6453 31.0772C14.481 30.6543 14.2855 30.019 14.2321 28.849C14.1744 27.5836 14.1622 27.2041 14.1622 23.9999C14.1622 20.7958 14.1744 20.4163 14.2321 19.1509C14.2855 17.981 14.481 17.3456 14.6453 16.9227C14.863 16.3626 15.123 15.9629 15.543 15.543C15.9629 15.123 16.3626 14.863 16.9227 14.6453C17.3456 14.481 17.981 14.2855 19.151 14.2321C20.4163 14.1744 20.7959 14.1622 24 14.1622ZM24 12C20.741 12 20.3323 12.0138 19.0524 12.0722C17.7752 12.1305 16.9028 12.3333 16.1395 12.63C15.3504 12.9366 14.6812 13.3469 14.0141 14.0141C13.3469 14.6812 12.9366 15.3504 12.63 16.1395C12.3333 16.9028 12.1305 17.7751 12.0722 19.0524C12.0138 20.3323 12 20.741 12 23.9999C12 27.259 12.0138 27.6676 12.0722 28.9475C12.1305 30.2248 12.3333 31.0971 12.63 31.8604C12.9366 32.6495 13.3469 33.3187 14.0141 33.9859C14.6812 34.653 15.3504 35.0633 16.1395 35.3699C16.9028 35.6666 17.7752 35.8694 19.0524 35.9277C20.3323 35.9861 20.741 35.9999 24 35.9999C27.259 35.9999 27.6677 35.9861 28.9476 35.9277C30.2248 35.8694 31.0972 35.6666 31.8605 35.3699C32.6496 35.0633 33.3188 34.653 33.9859 33.9859C34.653 33.3187 35.0634 32.6495 35.37 31.8604C35.6667 31.0971 35.8695 30.2248 35.9278 28.9475C35.9862 27.6676 36 27.259 36 23.9999C36 20.741 35.9862 20.3323 35.9278 19.0524C35.8695 17.7751 35.6667 16.9028 35.37 16.1395C35.0634 15.3504 34.653 14.6812 33.9859 14.0141C33.3188 13.3469 32.6496 12.9366 31.8605 12.63C31.0972 12.3333 30.2248 12.1305 28.9476 12.0722C27.6677 12.0138 27.259 12 24 12Z"
        fill="white"
      />
      <path
        d="M24.0059 17.8433C20.6026 17.8433 17.8438 20.6021 17.8438 24.0054C17.8438 27.4087 20.6026 30.1675 24.0059 30.1675C27.4092 30.1675 30.1681 27.4087 30.1681 24.0054C30.1681 20.6021 27.4092 17.8433 24.0059 17.8433ZM24.0059 28.0054C21.7968 28.0054 20.0059 26.2145 20.0059 24.0054C20.0059 21.7963 21.7968 20.0054 24.0059 20.0054C26.2151 20.0054 28.0059 21.7963 28.0059 24.0054C28.0059 26.2145 26.2151 28.0054 24.0059 28.0054Z"
        fill="white"
      />
      <path
        d="M31.8507 17.5963C31.8507 18.3915 31.206 19.0363 30.4107 19.0363C29.6154 19.0363 28.9707 18.3915 28.9707 17.5963C28.9707 16.801 29.6154 16.1562 30.4107 16.1562C31.206 16.1562 31.8507 16.801 31.8507 17.5963Z"
        fill="white"
      />
    </svg>
  ),
  tiktok: (props: IconProps) => (
    <svg
      width="512px"
      height="512px"
      viewBox="0 0 512 512"
      id="icons"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M412.19,118.66a109.27,109.27,0,0,1-9.45-5.5,132.87,132.87,0,0,1-24.27-20.62c-18.1-20.71-24.86-41.72-27.35-56.43h.1C349.14,23.9,350,16,350.13,16H267.69V334.78c0,4.28,0,8.51-.18,12.69,0,.52-.05,1-.08,1.56,0,.23,0,.47-.05.71,0,.06,0,.12,0,.18a70,70,0,0,1-35.22,55.56,68.8,68.8,0,0,1-34.11,9c-38.41,0-69.54-31.32-69.54-70s31.13-70,69.54-70a68.9,68.9,0,0,1,21.41,3.39l.1-83.94a153.14,153.14,0,0,0-118,34.52,161.79,161.79,0,0,0-35.3,43.53c-3.48,6-16.61,30.11-18.2,69.24-1,22.21,5.67,45.22,8.85,54.73v.2c2,5.6,9.75,24.71,22.38,40.82A167.53,167.53,0,0,0,115,470.66v-.2l.2.2C155.11,497.78,199.36,496,199.36,496c7.66-.31,33.32,0,62.46-13.81,32.32-15.31,50.72-38.12,50.72-38.12a158.46,158.46,0,0,0,27.64-45.93c7.46-19.61,9.95-43.13,9.95-52.53V176.49c1,.6,14.32,9.41,14.32,9.41s19.19,12.3,49.13,20.31c21.48,5.7,50.42,6.9,50.42,6.9V131.27C453.86,132.37,433.27,129.17,412.19,118.66Z" />
    </svg>
  ),
  youtube: (props: IconProps) => (
    <svg
      width="800px"
      height="800px"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      <path
        fill="red"
        d="M14.712 4.633a1.754 1.754 0 00-1.234-1.234C12.382 3.11 8 3.11 8 3.11s-4.382 0-5.478.289c-.6.161-1.072.634-1.234 1.234C1 5.728 1 8 1 8s0 2.283.288 3.367c.162.6.635 1.073 1.234 1.234C3.618 12.89 8 12.89 8 12.89s4.382 0 5.478-.289a1.754 1.754 0 001.234-1.234C15 10.272 15 8 15 8s0-2.272-.288-3.367z"
      />
      <path fill="#ffffff" d="M6.593 10.11l3.644-2.098-3.644-2.11v4.208z" />
    </svg>
  ),
};
