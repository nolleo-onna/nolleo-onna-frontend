import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const badgeVariants = cva(
  `
  inline-flex
  items-center
  justify-center
  rounded-full
  px-3
  py-1
  text-xs
  font-semibold
  border
  transition-colors
  `,
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-700 border-slate-200",

        official:
          "bg-sky-50 text-sky-600 border-sky-100",

        hot:
          "bg-pink-50 text-pink-600 border-pink-100",

        crowd:
          "bg-orange-50 text-orange-600 border-orange-100",

        relaxed:
          "bg-emerald-50 text-emerald-600 border-emerald-100",

        ai:
          "bg-violet-50 text-violet-600 border-violet-100",

        free:
          "bg-gray-50 text-gray-600 border-gray-200",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export default function Badge({
  variant,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({
          variant,
        }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}