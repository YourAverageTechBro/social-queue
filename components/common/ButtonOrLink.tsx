"use client";

import { ComponentProps } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useFormStatus } from "react-dom";
import { Tooltip } from "react-tooltip";

export type ButtonOrLinkProps = ComponentProps<"button"> &
  ComponentProps<"a"> & {
    openInNewTab?: boolean;
    loading?: boolean;
    tooltip?: string;
    tooltipId?: string;
  };

export interface Props extends ButtonOrLinkProps {}

/**
 * This is a base component that will render either a button or a link,
 * depending on the props that are passed to it. The link rendered will
 * also correctly get wrapped in a next/link component to ensure ideal
 * page-to-page transitions.
 */
export function ButtonOrLink({
  openInNewTab,
  href,
  tooltip,
  tooltipId,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  if (props.loading || pending) {
    return <LoadingSpinner />;
  }
  const isLink = typeof href !== "undefined";

  let content = (
    <>
      <button {...props} data-tooltip-id={tooltipId} data-tooltip-place="top" />
      {tooltip && (
        <Tooltip id={tooltipId}>
          <div className={"w-56"}>{tooltip}</div>
        </Tooltip>
      )}
    </>
  );
  if (isLink) {
    if (openInNewTab) {
      return (
        <Link href={href} target={"_blank"} rel={"noopener noreferrer"}>
          {" "}
          {content}{" "}
        </Link>
      );
    } else {
      return <Link href={href}>{content}</Link>;
    }
  }

  return content;
}
