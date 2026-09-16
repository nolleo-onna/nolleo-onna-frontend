import Modal from "@/components/ui/Modal";
import { COURSE_START_AREAS } from "@/constants/course";

// 코스 생성 API가 받는 지역과 정확히 같아야 한다. 목록에 없는 값(예: "사상구")을
// 보내면 서버가 UNKNOWN_START_AREA로 막는다.
const REGIONS = COURSE_START_AREAS;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: string;
  onSelect: (region: string) => void;
};

export default function RegionModal({ isOpen, onClose, selectedRegion, onSelect }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="지역 선택">
      <div className="grid grid-cols-4 gap-2 mb-6">
        {REGIONS.map((region) => (
          <button
            key={region}
            onClick={() => onSelect(region)}
            className={`py-2 rounded-full text-sm font-medium transition-colors ${
              selectedRegion === region
                ? "bg-ocean-500 text-white"
                : "border border-gray-200 text-gray-700 hover:border-ocean-500 hover:text-ocean-500"
            }`}
          >
            {region}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-full bg-ocean-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:bg-ocean-600 transition-all duration-200 active:scale-95"
      >
        적용하기
      </button>
    </Modal>
  );
}