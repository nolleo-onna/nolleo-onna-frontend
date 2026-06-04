import { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const chipVariants = cva(
  "inline-flex items-center justify-center rounded-full border transition-colors font-medium",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 bg-white text-black hover:bg-gray-100",

        selected:
          "bg-pink-500 border-pink-500 text-white hover:bg-pink-600",

        outline:
          "border-pink-500 text-pink-500 bg-white",
      },

      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface ChipProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {}

export default function Chip({
  variant,
  size,
  className,
  ...props
}: ChipProps) {
  return (
    <button
      className={cn(
        chipVariants({
          variant,
          size,
        }),
        className
      )}
      {...props}
    />
  );
}