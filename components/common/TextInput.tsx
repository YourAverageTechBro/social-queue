export default function TextInput({
  name,
  type,
  placeholder,
  required = false,
  defaultValue,
}: {
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <input
      className={
        "rounded-lg p-2 text-lg text-black w-full border-2 border-gray-500"
      }
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      defaultValue={defaultValue}
    />
  );
}
