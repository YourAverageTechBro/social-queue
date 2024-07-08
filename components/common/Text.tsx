import { cva, VariantProps } from "class-variance-authority";

const textStyles = cva("", {
  variants: {
    intent: {
      jumboTitle: "font-bold text-5xl md:text-6xl",
      title: "font-extrabold text-3xl",
      subtitle: "font-bold text-xl",
      body: "text-md",
    },
    color: {
      error: "text-red-500",
      accent: "text-orange-600",
      secondary: "text-gray-400",
    },
    alignment: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    intent: "body",
    alignment: "center",
  },
});

type TextProps = {
  text: string;
  additionalStyles?: string;
};

export interface Props extends TextProps, VariantProps<typeof textStyles> {}

const Text = ({ intent, alignment, additionalStyles, ...props }: Props) => (
  <p
    className={`${textStyles({
      alignment,
      intent,
    })} ${additionalStyles}`}
  >
    {props.text}
  </p>
);

export default Text;
