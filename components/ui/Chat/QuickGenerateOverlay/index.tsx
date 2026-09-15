'use client';

import { useEffect, useState } from 'react';
import { Check, CloudSun, ListChecks, MapPin, Route } from 'lucide-react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import AssistantAvatar from '@/components/ui/Chat/AssistantAvatar';
import { backdropMotion, launchContent, launchPanel } from '@/components/ui/Chat/launchMotion';
import { ASSISTANT_NAME } from '@/constants/assistant';

import type { LucideIcon } from 'lucide-react';

interface QuickGenerateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** 코스가 만들어졌을 때 true — 게이지를 100%로 채우고 완료 문구를 보여준 뒤 결과로 넘어간다 */
  done?: boolean;
}

// 생성은 요청 한 번으로 끝나서 실제 진행률이 없다. 대신 온나가 하는 일을 네 단계로 나눠
// 시간이 갈수록 천천히 차오르게(최대 92%) 보여주고, 응답이 오면 100%로 마무리한다.
const STAGES: { icon: LucideIcon; label: string; from: number }[] = [
  { icon: ListChecks, label: '조건 정리', from: 0 },
  { icon: MapPin, label: '관광지 고르기', from: 18 },
  { icon: CloudSun, label: '혼잡도·날씨 확인', from: 48 },
  { icon: Route, label: '동선·비용 계산', from: 74 },
];
const CEILING = 92;
const TICK_MS = 120;
/** 매 틱마다 남은 거리의 이만큼 전진 — 약 10초에 80%쯤 도달 */
const APPROACH = 0.021;

const RING_R = 54;
const RING_C = 2 * Math.PI * RING_R;

/** 검색바처럼 조건이 이미 확정된 요청은 대화형 챗 모달 대신 이 진행 화면을 보여준다.
 *  실제 생성 로직은 AIChatProvider가 백그라운드에서 처리한다. 채팅 모달과 같은 동작으로,
 *  누른 버튼 자리에서 커져 나오고 취소하면 그 자리로 돌아간다. */
export default function QuickGenerateOverlay({ isOpen, onClose, done = false }: QuickGenerateOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);
  // 다시 열릴 때 0부터 시작 — 렌더 중에 이전 isOpen과 비교해 되돌린다
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (isOpen) setElapsed(0);
  }

  useEffect(() => {
    if (!isOpen || done) return;
    const timer = setInterval(() => {
      setElapsed((p) => Math.min(CEILING, p + (CEILING - p) * APPROACH));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [isOpen, done]);

  const progress = done ? 100 : elapsed;

  const spring = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  useEffect(() => {
    if (reduceMotion) spring.jump(progress);
    else spring.set(progress);
  }, [progress, reduceMotion, spring]);

  const dashOffset = useTransform(spring, (v) => RING_C * (1 - v / 100));
  const percentText = useTransform(spring, (v) => `${Math.round(v)}`);

  const stageIndex = done ? STAGES.length : STAGES.findLastIndex((s) => progress >= s.from);
  const stage = STAGES[Math.min(stageIndex, STAGES.length - 1)];

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <div key="quick-generate-layer">
            <motion.div className="fixed inset-0 z-40 bg-[#0d3080]/20" {...backdropMotion} onClick={onClose} />
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="pointer-events-auto flex w-[340px] max-w-[calc(100vw-32px)] flex-col items-center rounded-3xl bg-white px-7 pb-6 pt-8
                           shadow-[0_24px_64px_rgba(13,48,128,0.25)]"
                variants={launchPanel}
                initial="from"
                animate="open"
                exit="back"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-live="polite"
                aria-label={done ? '코스 완성' : '코스 생성 중'}
              >
                {/* 링 게이지 — 온나 아바타를 둘러싸고 차오른다 */}
                <motion.div custom={0} variants={launchContent} className="relative h-[132px] w-[132px]">
                  <svg viewBox="0 0 132 132" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                    <defs>
                      <linearGradient id="quick-generate-ring" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0d3080" />
                        <stop offset="100%" stopColor="#34a6ff" />
                      </linearGradient>
                    </defs>
                    <circle cx="66" cy="66" r={RING_R} fill="none" stroke="#eaf6ff" strokeWidth="8" />
                    <motion.circle
                      cx="66"
                      cy="66"
                      r={RING_R}
                      fill="none"
                      stroke={done ? '#c8f135' : 'url(#quick-generate-ring)'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={RING_C}
                      style={{ strokeDashoffset: dashOffset }}
                    />
                  </svg>
                  {/* 링 위를 도는 빛 — 아직 만드는 중이라는 신호 */}
                  {!done && !reduceMotion && (
                    <motion.div
                      aria-hidden
                      className="absolute inset-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                    >
                      <span className="absolute left-1/2 top-[8px] h-2 w-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(52,166,255,0.55),0_0_12px_rgba(52,166,255,0.9)]" />
                    </motion.div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatePresence mode="wait" initial={false}>
                      {done ? (
                        <motion.span
                          key="done"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-300 text-navy-900"
                        >
                          <Check className="h-7 w-7" strokeWidth={3} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="avatar"
                          exit={{ scale: 0.6, opacity: 0 }}
                          animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
                          transition={{
                            scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                            opacity: { duration: 0.15 },
                          }}
                        >
                          <AssistantAvatar size={56} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                <motion.div custom={1} variants={launchContent} className="mt-4 text-center">
                  <p className="text-[34px] font-bold leading-none tracking-tight text-navy-900 tabular-nums">
                    <motion.span>{percentText}</motion.span>
                    <span className="ml-0.5 text-lg font-semibold text-gray-400">%</span>
                  </p>
                  <p className="mt-2 text-[15px] font-bold text-gray-900">
                    {done ? '코스가 완성됐어요!' : `${ASSISTANT_NAME}가 코스를 짜고 있어요`}
                  </p>
                  <p className="mt-0.5 h-[18px] text-[12px] text-gray-400">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={done ? 'done' : stage.label}
                        className="inline-block"
                        initial={{ y: 6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -6, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {done ? '결과 페이지로 이동할게요' : `지금은 ${stage.label} 중`}
                      </motion.span>
                    </AnimatePresence>
                  </p>
                </motion.div>

                {/* 단계 체크리스트 — 지난 단계는 체크, 지금 단계는 파랗게 */}
                <motion.ol custom={2} variants={launchContent} className="mt-5 w-full space-y-1.5">
                  {STAGES.map(({ icon: Icon, label }, i) => {
                    const state = done || i < stageIndex ? 'done' : i === stageIndex ? 'active' : 'todo';
                    return (
                      <li
                        key={label}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors ${
                          state === 'active'
                            ? 'bg-ocean-50 font-semibold text-navy-900'
                            : state === 'done'
                              ? 'text-gray-500'
                              : 'text-gray-300'
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            state === 'done'
                              ? 'bg-lime-300 text-navy-900'
                              : state === 'active'
                                ? 'bg-ocean-500 text-white'
                                : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {state === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
                        </span>
                        <span className="flex-1">{label}</span>
                        {state === 'active' && !reduceMotion && (
                          <motion.span
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full bg-ocean-500"
                            animate={{ opacity: [1, 0.2, 1] }}
                            transition={{ duration: 1.1, repeat: Infinity }}
                          />
                        )}
                      </li>
                    );
                  })}
                </motion.ol>

                {!done && (
                  <motion.button
                    custom={3}
                    variants={launchContent}
                    onClick={onClose}
                    className="mt-4 text-[12px] font-medium text-gray-400 transition-colors hover:text-gray-600"
                  >
                    취소
                  </motion.button>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
