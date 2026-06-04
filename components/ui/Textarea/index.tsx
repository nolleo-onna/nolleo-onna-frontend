import { TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const textareaVariants = cva(
  `
  w-full
  rounded-2xl
  border
  bg-white
  px-4
  py-3
  outline-none
  transition-all
  placeholder:text-gray-400
  resize-none
  `,
  {
    variants: {
      variant: {
        default:
          "border-gray-300 focus:border-blue-500",

        error:
          "border-red-500 focus:border-red-500",

        disabled:
          "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
);

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

export default function Textarea({
  variant,
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        textareaVariants({
          variant,
        }),
        "resize-none",
        className
      )}
      {...props}
    />
  );
}