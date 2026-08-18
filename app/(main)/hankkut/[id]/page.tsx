import { notFound } from "next/navigation";
import { motion } from "motion/react";

import HankkutDetailContent from "@/features/hankkut/components/HankkutDetailContent";
import HankkutDetailHeader from "@/features/hankkut/components/HankkutDetailHeader";
import HankkutDetailSidebar from "@/features/hankkut/components/HankkutDetailSidebar";
import {
  getHankkutDetail,
  getOtherHankkutList,
} from "@/features/hankkut/data/hankkutDetail";

interface HankkutDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HankkutDetailPage({
  params,
}: HankkutDetailPageProps) {
  const { id } = await params;
  const hankkut = getHankkutDetail(Number(id));

  if (!hankkut) notFound();

  const otherList = getOtherHankkutList(hankkut.id);

  return (
    <div className="pt-16">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <HankkutDetailHeader hankkut={hankkut} />
        </motion.div>
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
          >
            <HankkutDetailContent hankkut={hankkut} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
          >
            <HankkutDetailSidebar hankkut={hankkut} otherList={otherList} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
