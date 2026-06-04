import { forwardRef, InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const inputVariants = cva(
  "flex w-full rounded-3xl border bg-white outline-none transition-all placeholder:text-gray-400",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",

        error:
          "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100",

        disabled:
          "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
      },

      inputSize: {
        sm: "h-11 px-4 text-sm",
        md: "h-14 px-6 text-base",
        lg: "h-16 px-7 text-lg",
      },
    },

    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          inputVariants({
            variant,
            inputSize,
          }),
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;