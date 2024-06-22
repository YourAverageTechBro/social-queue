import { Dispatch, SetStateAction } from "react";
import { Switch } from "@headlessui/react";
import "react-tooltip/dist/react-tooltip.css";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Toggle({
  enabled,
  setEnabled,
  label,
  toolTipString,
  toolTipId,
}: {
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
  label?: string;
  toolTipString?: string;
  toolTipId?: string;
}) {
  return (
    <>
      <Switch.Group as="div" className="flex items-center">
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={classNames(
            enabled ? "bg-orange-600" : "bg-gray-200",
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              enabled ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            )}
          />
        </Switch>
        <Switch.Label as="span" className="ml-3 text-sm flex items-center">
          {label && <span className="font-medium text-white">{label}</span>}
          {toolTipId && toolTipString && (
            <span
              className="ml-2 text-white"
              data-tooltip-id={toolTipId}
              data-tooltip-place="top"
            >
              <InformationCircleIcon className={"h-4 w-4 text-orange-950"} />
            </span>
          )}
        </Switch.Label>
      </Switch.Group>
      <Tooltip id={toolTipId}>
        <p className={"w-56"}> {toolTipString}</p>
      </Tooltip>
    </>
  );
}
