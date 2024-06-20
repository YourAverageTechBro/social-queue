import { cva, VariantProps } from "class-variance-authority";

const textStyles = cva("", {
  variants: {
    intent: {
      jumboTitle: "font-bold text-5xl md:text-6xl",
      title: "font-bold text-3xl",
      subtitle: "font-medium text-xl",
      body: "font-medium text-md",
    },
    color: {
      black: "text-black",
      white: "text-white",
      error: "text-red-500",
      accent: "text-orange-600",
    },
    alignment: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    intent: "body",
    color: "white",
    alignment: "center",
  },
});

type TextProps = {
  text: string;
};

export interface Props extends TextProps, VariantProps<typeof textStyles> {}

const Text = ({ intent, color, alignment, ...props }: Props) => (
  <p className={textStyles({ alignment, intent, color })}>{props.text}</p>
);

export default Text;
