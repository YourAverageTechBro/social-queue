import { ChangeEvent, useState } from "react";

export default function TextArea({
  title,
  characterLimit,
  disabled,
  name,
  placeholder,
}: {
  name: string;
  title?: string;
  characterLimit?: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [textLength, setTextLength] = useState(0);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTextLength(event.target.value.length);
  };
  return (
    <div className={"w-full"}>
      {title && (
        <label
          htmlFor="comment"
          className="block text-sm font-medium leading-6"
        >
          {title}
        </label>
      )}
      <textarea
        rows={4}
        name={name}
        id={name}
        className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        disabled={disabled}
        onChange={handleTextChange}
        placeholder={placeholder}
      />
      {characterLimit && (
        <p
          className={`mt-2 text-sm text-right ${
            textLength > characterLimit ? "text-red-600" : "text-gray-400"
          }`}
        >
          {textLength}/{characterLimit}
        </p>
      )}
    </div>
  );
}
