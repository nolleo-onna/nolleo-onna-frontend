"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* 모달 */}
      <div
        className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
          )}
          <button
            onClick={onClose}
            aria-label="닫기"
            className="ml-auto p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}