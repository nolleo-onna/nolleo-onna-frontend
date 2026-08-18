"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 현재 화면에 표시 중인 닉네임 (커스텀 닉네임이 있으면 그 값) */
  currentNickname: string;
  /** 소셜 계정에서 받아온 원래 닉네임 */
  socialNickname: string;
  onSave: (nickname: string) => void;
}

const MIN_LENGTH = 2;
const MAX_LENGTH = 12;

export default function ProfileEditModal({
  isOpen,
  onClose,
  currentNickname,
  socialNickname,
  onSave,
}: ProfileEditModalProps) {
  const [value, setValue] = useState(currentNickname);

  // 모달을 다시 열 때마다 현재 닉네임으로 입력값을 초기화
  useEffect(() => {
    if (isOpen) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- 열림 시점의 최신 닉네임으로 폼 리셋 */
      setValue(currentNickname);
    }
  }, [isOpen, currentNickname]);

  const trimmed = value.trim();
  // 비우면 소셜 닉네임으로 복원이라 유효, 입력했다면 2자 이상이어야 함
  const isValid = trimmed.length === 0 || trimmed.length >= MIN_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="닉네임 수정">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={MAX_LENGTH}
            placeholder={socialNickname}
            autoFocus
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-ocean-400 focus:bg-white"
          />
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className={isValid ? "text-gray-400" : "text-error"}>
              {isValid
                ? `비워두고 저장하면 소셜 계정 닉네임(${socialNickname})으로 돌아가요`
                : `닉네임은 ${MIN_LENGTH}자 이상 입력해주세요`}
            </span>
            <span className="shrink-0 tabular-nums text-gray-400">
              {value.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <p className="rounded-xl bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-500">
          변경한 닉네임은 지금 사용 중인 브라우저에 저장돼요. 다른 기기에서는
          소셜 계정 닉네임이 보여요.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 rounded-xl bg-ocean-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-ocean-600 disabled:opacity-40"
          >
            저장
          </button>
        </div>
      </form>
    </Modal>
  );
}
