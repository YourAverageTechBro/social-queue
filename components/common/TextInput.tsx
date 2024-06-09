import { useState } from "react";

export default function TextInput({
  name,
  type,
  placeholder,
  required = false,
  defaultValue,
  maxLength,
  title,
  value,
  setValue,
}: {
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  maxLength?: number;
  title?: string;
  value?: string;
  setValue?: (value: string) => void;
}) {
  const [error, setError] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (maxLength && inputValue.length > maxLength) {
      setError(`Character limit of ${maxLength} exceeded.`);
    } else {
      setError("");
    }
    setValue?.(inputValue);
  };

  return (
    <div>
      {title && <div className="text-sm font-bold">{title}</div>}
      <input
        className={
          "rounded-lg p-2 text-lg text-black w-full border-2 " +
          (error ? "border-red-500" : "border-gray-500")
        }
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={handleChange}
      />
      {value && maxLength && (
        <div className="text-right text-sm">
          {value.length}/{maxLength}
        </div>
      )}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}
