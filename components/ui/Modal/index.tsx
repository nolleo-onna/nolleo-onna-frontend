import { ReactNode } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}