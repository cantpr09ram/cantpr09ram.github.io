"use client"

import { useState } from "react"

export interface TimeSlot {
  startTime: string
  endTime: string
  label: string
  description?: string
  period: "work" | "life" | "personal"
}

export interface WorkdayTimelineProps {
  slots?: TimeSlot[]
  title?: string
  date?: string
}

const DEFAULT_SLOTS: TimeSlot[] = [
  {
    startTime: "00:00",
    endTime: "6:00",
    label: "睡覺",
    description: "我知道我的睡眠時間有點少，不過我個人認為還好。我真的累到不行我會提早睡，例如從21:00 開始睡覺",
    period: "life",
  },
  {
    startTime: "6:30",
    endTime: "8:00",
    label: "Morning Routine",
    description: "起床盥洗。開電腦看美股(其實也沒有多少錢)。然後看昨天還沒看完的東西一邊運動，最近在挑戰每天拉單槓。泡咖啡，如果天氣熱的話會沖冷水澡。洗衣服，打掃一下",
    period: "personal",
  },
  {
    startTime: "8:00",
    endTime: "9:00",
    label: "緩衝",
    description: "其實到公司或是到學校我都只需要大概 20 分鐘，不過我會預留時間來應對突發狀況",
    period: "life",
  },
  {
    startTime: "9:00",
    endTime: "12:00",
    label: "上工",
    description: "以前就是去上課，沒課就是去圖書館待著。最近就是去公司上班。",
    period: "work",
  },
  {
    startTime: "12:00",
    endTime: "13:00",
    label: "Lunch Break",
    description: "有時候沒事會提早吃，在學校的話我會吃學餐的自助餐或是旁邊的早餐店。如果下午有硬仗的話我會再喝咖啡。",
    period: "life",
  },
  {
    startTime: "13:00",
    endTime: "18:00",
    label: "上工",
    description: "跟早上一樣，第二輪",
    period: "work",
  },
  {
    startTime: "18:00",
    endTime: "19:00",
    label: "緩衝",
    description: "把手邊的事做個收尾，跟別人聊天，星期一的話回家煮飯",
    period: "life",
  },
  {
    startTime: "19:00",
    endTime: "20:00",
    label: "跑步",
    description: "以前是一個星期跑兩到三天，最近的目標是盡可能每天 10 km",
    period: "personal",
  },
  {
    startTime: "20:00",
    endTime: "0:00",
    label: "個人時間",
    description: "吃飯、洗澡、個人時間 (讀書、side project)",
    period: "life",
  },
]

const PERIOD_META = {
  life: {
    label: "Life",
    barClass: "bg-neutral-200 dark:bg-neutral-700",
    badgeClass: "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300",
    dotClass: "bg-neutral-200 dark:bg-neutral-700",
  },
  work: {
    label: "Work",
    barClass: "bg-neutral-900 dark:bg-neutral-100",
    badgeClass: "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900",
    dotClass: "bg-neutral-900 dark:bg-neutral-100",
  },
  personal: {
    label: "Personal",
    barClass: "bg-neutral-500",
    badgeClass: "bg-neutral-500 text-white",
    dotClass: "bg-neutral-500",
  },
}

function timeToMinutes(time: string): number {
  const [h, m = "0"] = time.split(":")
  return parseInt(h) * 60 + parseInt(m)
}

const DAY_START = 0
const DAY_END = 24 * 60
const DAY_DURATION = DAY_END - DAY_START

function SlotBar({
  slot,
  isActive,
  onClick,
}: {
  slot: TimeSlot
  isActive: boolean
  onClick: () => void
}) {
  const start = timeToMinutes(slot.startTime)
  const end = timeToMinutes(slot.endTime === "24:00" ? "0:00" : slot.endTime) || DAY_DURATION
  const meta = PERIOD_META[slot.period]
  const barClass = `mx-px h-full rounded-sm transition-all duration-200 ${meta.barClass} ${isActive ? "opacity-100 scale-y-110" : "opacity-80 group-hover:opacity-100"}`

  const wraps = end !== DAY_DURATION && end < start
  const segments = wraps
    ? [{ left: (start / DAY_DURATION) * 100, width: ((DAY_DURATION - start) / DAY_DURATION) * 100 },
       { left: 0, width: (end / DAY_DURATION) * 100 }]
    : [{ left: (start / DAY_DURATION) * 100, width: ((end - start) / DAY_DURATION) * 100 }]

  return (
    <>
      {segments.map((seg, i) => (
        <button
          key={i}
          onClick={onClick}
          aria-pressed={isActive}
          aria-label={`${slot.label}, ${slot.startTime} to ${slot.endTime}`}
          className="absolute top-0 h-full group focus:outline-none"
          style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
        >
          <div className={barClass} />
        </button>
      ))}
    </>
  )
}

function HourTick({ hour }: { hour: number }) {
  const pct = (hour * 60 / DAY_DURATION) * 100
  const label = String(hour).padStart(2, "0")
  return (
    <div
      className="absolute top-0 flex flex-col items-center"
      style={{ left: `${pct}%` }}
      aria-hidden="true"
    >
      <div className="h-1.5 w-px bg-neutral-200 dark:bg-neutral-700" />
      <span className="mt-0.5 text-[9px] font-mono text-neutral-400 dark:text-neutral-500 -translate-x-1/2 select-none">
        {label}
      </span>
    </div>
  )
}

export function WorkdayTimeline({
  slots = DEFAULT_SLOTS,
  title = "我的一天",
  date,
}: WorkdayTimelineProps) {
  const [activeId, setActiveId] = useState<string | null>(slots[0]?.startTime ?? null)
  const activeSlot = slots.find((s) => s.startTime === activeId) ?? null

  const ticks = [0, 3, 6, 9, 12, 15, 18, 21]

  const periods = (["life", "work", "personal"] as const).map((p) => ({
    period: p,
    meta: PERIOD_META[p],
  }))

  return (
    <figure
      role="figure"
      aria-label={`${title} timeline`}
      className="not-prose my-6 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 font-sans"
    >
      {/* Header */}
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</span>
          {date && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">{date}</span>
          )}
        </div>
        <div className="flex items-center gap-3" aria-label="Period legend">
          {periods.map(({ period, meta }) => (
            <div key={period} className="flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-sm ${meta.barClass}`} aria-hidden="true" />
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{meta.label}</span>
            </div>
          ))}
        </div>
      </figcaption>

      {/* Timeline bar */}
      <div className="w-full" role="presentation">
        <div className="relative h-7 w-full rounded-sm bg-neutral-100 dark:bg-neutral-800">
          {slots.map((slot) => (
            <SlotBar
              key={slot.startTime}
              slot={slot}
              isActive={activeId === slot.startTime}
              onClick={() => setActiveId(activeId === slot.startTime ? null : slot.startTime)}
            />
          ))}
        </div>
        <div className="relative h-5 w-full">
          {ticks.map((h) => (
            <HourTick key={h} hour={h} />
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div aria-live="polite" className="mt-2">
        {activeSlot ? (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2">
            <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-none">{activeSlot.label}</span>
            <span className="block mt-2 text-xs font-mono text-neutral-400 dark:text-neutral-500 leading-none">{activeSlot.startTime} – {activeSlot.endTime}</span>
            {activeSlot.description && (
              <span className="block mt-0.5 text-xs text-neutral-900 dark:text-neutral-100 leading-none">{activeSlot.description}</span>
            )}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">Click a segment.</p>
        )}
      </div>
    </figure>
  )
}
