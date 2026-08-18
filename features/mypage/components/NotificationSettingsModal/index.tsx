"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";

const STORAGE_KEY = "mypage:notification-settings";

interface NotificationSettings {
  hankkut: boolean;
  course: boolean;
  crowd: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  hankkut: true,
  course: true,
  crowd: false,
};

const OPTIONS: {
  key: keyof NotificationSettings;
  label: string;
  description: string;
}[] = [
  {
    key: "hankkut",
    label: "한끗 새 소식",
    description: "행사·무료·할인 정보가 새로 올라오면 알려드려요",
  },
  {
    key: "course",
    label: "코스 추천",
    description: "취향에 맞는 새 추천 코스가 생기면 알려드려요",
  },
  {
    key: "crowd",
    label: "혼잡도 알림",
    description: "관심 지역이 혼잡해지면 미리 알려드려요",
  },
];

function readSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<NotificationSettings>) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  // 모달을 열 때마다 저장된 설정을 다시 읽어온다
  useEffect(() => {
    if (isOpen) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 후에만 localStorage를 읽어야 하이드레이션 불일치가 안 생김 */
      setSettings(readSettings());
    }
  }, [isOpen]);

  const toggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="알림 설정">
      <div className="flex flex-col gap-1">
        {OPTIONS.map(({ key, label, description }) => (
          <button
            key={key}
            role="switch"
            aria-checked={settings[key]}
            onClick={() => toggle(key)}
            className="flex w-full items-center justify-between gap-4 rounded-xl px-2 py-3 text-left transition-colors hover:bg-gray-50"
          >
            <span>
              <span className="block text-sm font-semibold text-gray-900">
                {label}
              </span>
              <span className="mt-0.5 block text-[11px] text-gray-500">
                {description}
              </span>
            </span>
            <span
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                settings[key] ? "bg-ocean-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                  settings[key] ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-500">
        알림 설정은 지금 사용 중인 브라우저에 저장돼요. 푸시 알림 기능은 준비
        중이에요.
      </p>
    </Modal>
  );
}
