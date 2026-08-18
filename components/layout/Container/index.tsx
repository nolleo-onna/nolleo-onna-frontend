import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({
  children,
  className,
}: ContainerProps) {
  return (
    <div
      className={`
        mx-auto
        w-full
        max-w-screen-2xl
        px-4
        md:px-8
        lg:px-20
        ${className ?? ""}
      `}
    >
      {children}
    </div>
  );
}