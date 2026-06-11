import Modal from "@/components/ui/Modal";

const REGIONS = [
  "해운대", "광안리", "서면", "영도",
  "전포", "남포", "기장", "동래",
  "중구", "부산진구", "북구", "사하구",
  "강서구", "연제구", "수영구", "사상구",
];

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
                ? "bg-pink-400 text-white"
                : "border border-gray-200 text-gray-700 hover:border-pink-400 hover:text-pink-400"
            }`}
          >
            {region}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-pink-400 text-white font-semibold text-sm"
      >
        적용하기
      </button>
    </Modal>
  );
}