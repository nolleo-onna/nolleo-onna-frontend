"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Wallet, Clock, Users, Sparkles } from "lucide-react";
import RegionModal from "@/components/ui/Modal/RegionModal";
import { useAIChatContext } from "@/providers/AIChatProvider";

type Tab = "course" | "spot";

const BUDGET_OPTIONS = ["무지출", "1만원", "3만원", "5만원", "제한 없음"];

// 결과 페이지의 예산 게이지에 쓰이는 금액값. "제한 없음"은 기준값이 없어 제외.
const BUDGET_AMOUNT: Record<string, number> = {
  "무지출": 0,
  "1만원": 10_000,
  "3만원": 30_000,
  "5만원": 50_000,
};
const TIME_OPTIONS = ["오전", "오후", "반나절"];
const COMPANION_OPTIONS = ["혼자", "연인", "친구", "가족", "단체"];

// 자연어 프롬프트 변환용 라벨
const TIME_LABEL: Record<string, string> = {
  "오전": "오전에",
  "오후": "오후에",
  "반나절": "반나절 동안",
};

const COMPANION_LABEL: Record<string, string> = {
  "혼자": "혼자",
  "연인": "연인과",
  "친구": "친구와",
  "가족": "가족과",
  "단체": "단체로",
};

const STORAGE_KEY = "searchbar-selection";

type StoredSelection = {
  activeTab: Tab;
  selectedRegion: string;
  selectedBudget: string;
  selectedTime: string;
  selectedCompanion: string;
  hasInteracted: boolean;
};

const DEFAULT_SELECTION: StoredSelection = {
  activeTab: "course",
  selectedRegion: "광안리",
  selectedBudget: "5만원",
  selectedTime: "반나절",
  selectedCompanion: "연인",
  hasInteracted: false,
};

// ── 필드 카드 ────────────────────────────────────────────────────────────────
type FieldCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  onClick: () => void;
  children?: React.ReactNode;
};

function FieldCard({ icon, iconBg, label, value, onClick, children }: FieldCardProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 rounded-2xl bg-gray-50 p-3.5
                   hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 text-left"
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-gray-400 leading-none mb-1">{label}</p>
          <p className="text-[15px] font-semibold text-gray-800 truncate">{value}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0" />
      </button>
      {children}
    </div>
  );
}

// ── 드롭다운 ──────────────────────────────────────────────────────────────────
function Dropdown({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100
                   rounded-2xl shadow-[0_8px_24px_rgba(13,48,128,0.12)] z-30 overflow-hidden py-1">
      {options.map((opt) => (
        <li
          key={opt}
          onClick={() => onSelect(opt)}
          className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
            selected === opt
              ? "text-ocean-600 font-semibold bg-ocean-50/60"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {opt}
        </li>
      ))}
    </ul>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function SearchBar() {
  const router = useRouter();
  const { openChat, generateCourse } = useAIChatContext();

  const [activeTab, setActiveTab] = useState<Tab>(DEFAULT_SELECTION.activeTab);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(DEFAULT_SELECTION.selectedRegion);
  const [selectedBudget, setSelectedBudget] = useState(DEFAULT_SELECTION.selectedBudget);
  const [selectedTime, setSelectedTime] = useState(DEFAULT_SELECTION.selectedTime);
  const [selectedCompanion, setSelectedCompanion] = useState(DEFAULT_SELECTION.selectedCompanion);
  const [extraRequest, setExtraRequest] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(DEFAULT_SELECTION.hasInteracted);
  const [isHydrated, setIsHydrated] = useState(false);

  // sessionStorage 복원
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<StoredSelection>;
        /* eslint-disable react-hooks/set-state-in-effect */
        if (saved.activeTab) setActiveTab(saved.activeTab);
        if (saved.selectedRegion) setSelectedRegion(saved.selectedRegion);
        if (saved.selectedBudget) setSelectedBudget(saved.selectedBudget);
        if (saved.selectedTime) setSelectedTime(saved.selectedTime);
        if (saved.selectedCompanion) setSelectedCompanion(saved.selectedCompanion);
        if (saved.hasInteracted) setHasInteracted(saved.hasInteracted);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // sessionStorage 접근 실패 시 기본값 사용
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // sessionStorage 저장
  useEffect(() => {
    if (!isHydrated) return;
    const toSave: StoredSelection = {
      activeTab,
      selectedRegion,
      selectedBudget,
      selectedTime,
      selectedCompanion,
      hasInteracted,
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // 저장 실패 무시
    }
  }, [isHydrated, activeTab, selectedRegion, selectedBudget, selectedTime, selectedCompanion, hasInteracted]);

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleTabClick = (tab: Tab) => {
    if (tab === "spot") {
      router.push("/spot");
      return;
    }
    setActiveTab(tab);
  };

  // AI 버튼 → 빈 채팅창
  const openAIChat = () => {
    openChat();
  };

  // 검색 버튼 → 선택 조건을 자연어로 변환해 prefill
  const handleSearch = () => {
    const budgetLabel =
      selectedBudget === "제한 없음"
        ? "예산 제한 없이"
        : selectedBudget === "무지출"
          ? "돈 안 쓰고"
          : `${selectedBudget} 예산으로`;
    const timeLabel = TIME_LABEL[selectedTime] ?? selectedTime;
    const companionLabel = COMPANION_LABEL[selectedCompanion] ?? selectedCompanion;

    const prompt = `${selectedRegion}에서 ${companionLabel} ${timeLabel} ${budgetLabel} 코스 짜줘`;
    const trimmedExtra = extraRequest.trim();

    // 드롭다운으로 이미 모든 조건을 정한 뒤 누른 버튼이라, 그 자체가 확정 의사표시다.
    // 대화형 챗 모달 없이 바로 생성만 진행한다.
    generateCourse(trimmedExtra ? `${prompt}. ${trimmedExtra}` : prompt, {
      budget: BUDGET_AMOUNT[selectedBudget],
    });
  };

  const handleInteract = () => setHasInteracted(true);

  return (
    <>
      <div
        id="search-bar"
        onClick={handleInteract}
        className={`w-full max-w-3xl mx-auto rounded-3xl border border-gray-100 bg-white
                    shadow-[0_4px_24px_rgba(13,48,128,0.06)] p-5 ${
                      !hasInteracted ? "animate-wiggle" : ""
                    }`}
      >
        {/* ── 상단: 탭 + AI 버튼 ── */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="inline-flex bg-gray-50 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => handleTabClick("course")}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-all ${
                activeTab === "course"
                  ? "bg-white text-[#0d3080] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              코스 추천
            </button>
            <button
              onClick={() => handleTabClick("spot")}
              className="px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition-all"
            >
              스팟 검색
            </button>
          </div>

          <button
            onClick={openAIChat}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-ocean-50
                       text-ocean-600 text-xs sm:text-[13px] font-semibold
                       hover:bg-ocean-100 active:scale-95 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI에게 말하기
          </button>
        </div>

        {/* ── 필드 그리드 ── */}
        {activeTab === "course" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <FieldCard
                icon={<MapPin className="w-[19px] h-[19px]" style={{ color: "#185FA5" }} />}
                iconBg="#E6F1FB"
                label="어디로"
                value={selectedRegion}
                onClick={() => setIsRegionModalOpen(true)}
              />

              <FieldCard
                icon={<Wallet className="w-[19px] h-[19px]" style={{ color: "#3B6D11" }} />}
                iconBg="#EAF3DE"
                label="예산"
                value={selectedBudget}
                onClick={() => toggleDropdown("budget")}
              >
                {openDropdown === "budget" && (
                  <Dropdown
                    options={BUDGET_OPTIONS}
                    selected={selectedBudget}
                    onSelect={(v) => {
                      setSelectedBudget(v);
                      setOpenDropdown(null);
                    }}
                  />
                )}
              </FieldCard>

              <FieldCard
                icon={<Clock className="w-[19px] h-[19px]" style={{ color: "#854F0B" }} />}
                iconBg="#FAEEDA"
                label="시간"
                value={selectedTime}
                onClick={() => toggleDropdown("time")}
              >
                {openDropdown === "time" && (
                  <Dropdown
                    options={TIME_OPTIONS}
                    selected={selectedTime}
                    onSelect={(v) => {
                      setSelectedTime(v);
                      setOpenDropdown(null);
                    }}
                  />
                )}
              </FieldCard>

              <FieldCard
                icon={<Users className="w-[19px] h-[19px]" style={{ color: "#993556" }} />}
                iconBg="#FBEAF0"
                label="동행"
                value={selectedCompanion}
                onClick={() => toggleDropdown("companion")}
              >
                {openDropdown === "companion" && (
                  <Dropdown
                    options={COMPANION_OPTIONS}
                    selected={selectedCompanion}
                    onSelect={(v) => {
                      setSelectedCompanion(v);
                      setOpenDropdown(null);
                    }}
                  />
                )}
              </FieldCard>
            </div>

            {/* ── 자유 입력 (드롭다운으로 못 담는 조건 보완) ── */}
            <input
              type="text"
              value={extraRequest}
              onChange={(e) => setExtraRequest(e.target.value)}
              placeholder="꼭 가고 싶은 곳이나 피하고 싶은 곳이 있나요? (선택)"
              maxLength={100}
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 mb-4 text-sm text-gray-800
                         placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-ocean-200
                         transition-colors"
            />

            {/* ── 검색 버튼 ── */}
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-4
                         bg-gradient-to-r from-[#34a6ff] to-[#0a84ff] text-white
                         text-[15px] font-bold
                         shadow-[0_4px_16px_rgba(10,132,255,0.35)]
                         hover:shadow-[0_6px_22px_rgba(10,132,255,0.45)]
                         hover:brightness-105 active:scale-[0.98]
                         transition-all duration-150"
            >
              <Sparkles className="w-[18px] h-[18px]" />
              내 코스 만들기
            </button>
          </>
        )}
      </div>

      {/* 지역 모달 */}
      <RegionModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        selectedRegion={selectedRegion}
        onSelect={(region) => {
          setSelectedRegion(region);
          setIsRegionModalOpen(false);
        }}
      />
    </>
  );
}