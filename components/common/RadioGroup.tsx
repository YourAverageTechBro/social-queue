import { Dispatch, SetStateAction } from "react";

export default function RadioGroups<T>({
  options,
  value,
  setValue,
  title,
}: {
  options: {
    value: T;
    title: string;
  }[];
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  title: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold leading-6 text-gray-900">
        Notifications
      </legend>
      <p className="font-bold mt-1 text-sm leading-6 text-white">{title}</p>
      <div className="mt-2 space-y-6 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
        {options.map((option) => (
          <div key={String(option.value)} className="flex items-center">
            <input
              id={String(option.value)}
              name="notification-method"
              type="radio"
              className="h-4 w-4 border-gray-300 text-orange-600 focus:ring-orange-600"
              value={String(option.value)}
              checked={value === option.value}
              onChange={(e) => setValue(e.target.value as unknown as T)}
            />
            <label
              htmlFor={String(option.value)}
              className="ml-3 block text-sm font-medium leading-6 text-white"
            >
              {option.title}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
