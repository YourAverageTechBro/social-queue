import { cva, VariantProps } from "class-variance-authority";
import {
  ButtonOrLink,
  ButtonOrLinkProps,
} from "@/components/common/ButtonOrLink";

const buttonStyles = cva(
  "my-2 flex items-center justify-center px-4 py-2 line-clamp-1 rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-offset-white dark:focus:ring-offset-black focus:ring-offset-1 disabled:opacity-60 disabled:pointer-events-none hover:bg-opacity-80",
  {
    variants: {
      intent: {
        primary: "bg-orange-600 text-white",
        secondary:
          "bg-gray-200 text-gray-900 hover:bg-gray-300 hover:shadow-lg",
        whiteBackground:
          "bg-white text-gray-900 hover:bg-gray-300 hover:shadow-l border-2",
        lightBlue: "bg-sky-500 text-white",
        whiteText: "text-white underline",
        noBackground: "text-blue-950 font-medium",
        danger: "bg-red-500 text-white focus:ring-red-500",
      },
      fullWidth: {
        true: "w-full",
      },
      fixedWidth: {
        xs: "w-20",
        sm: "w-24",
        md: "w-32",
        lg: "w-48",
        xl: "w-64",
      },
      size: {
        xl: "text-2xl md:px-8 md:py-4",
        lg: "text-lg",
        md: "text-md px-4 py-2",
        sm: "text-sm px-2 py-2 w-36",
        base: "text-base",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export interface Props
  extends ButtonOrLinkProps,
    VariantProps<typeof buttonStyles> {}
export function Button({ intent, fullWidth, size, ...props }: Props) {
  return (
    <ButtonOrLink
      className={buttonStyles({ intent, fullWidth, size })}
      {...props}
    />
  );
}
