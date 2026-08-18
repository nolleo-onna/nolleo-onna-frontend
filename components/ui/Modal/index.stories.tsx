import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import Modal from "./index";

const meta = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    title: "지역 선택",
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-navy-900 text-white rounded-xl text-sm"
        >
          모달 열기
        </button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="지역 선택">
          <p className="text-sm text-gray-500">모달 내용이 여기에 들어옵니다.</p>
        </Modal>
      </>
    );
  },
};