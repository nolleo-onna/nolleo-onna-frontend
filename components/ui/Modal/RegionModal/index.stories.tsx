import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import RegionModal from "./index";

const meta = {
  title: "Home/SearchBar/RegionModal",
  component: RegionModal,
  tags: ["autodocs"],
} satisfies Meta<typeof RegionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    selectedRegion: "해운대",
    onSelect: () => {},
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState("해운대");
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-navy-900 text-white rounded-xl text-sm"
        >
          지역 선택 열기
        </button>
        <RegionModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          selectedRegion={selectedRegion}
          onSelect={(region) => {
            setSelectedRegion(region);
            setIsOpen(false);
          }}
        />
      </>
    );
  },
};