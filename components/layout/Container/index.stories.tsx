import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Container from "./index";

const meta = {
  title: "Layout/Container",
  component: Container,
  tags: ["autodocs"],
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Container",
  },

  render: () => (
    <div className="bg-gray-100 py-10">
      <Container>
        <div className="rounded-lg border border-dashed border-gray-400 bg-white p-6">
          Container 영역
        </div>
      </Container>
    </div>
  ),
};

export const WithContent: Story = {
  args: {
    children: "Container",
  },

  render: () => (
    <div className="bg-gray-100 py-10">
      <Container>
        <div className="space-y-4">
          <div className="h-20 rounded-lg bg-navy-500" />
          <div className="h-40 rounded-lg bg-pink-200" />
          <div className="h-20 rounded-lg bg-lime-200" />
        </div>
      </Container>
    </div>
  ),
};