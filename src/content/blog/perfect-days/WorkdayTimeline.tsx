"use client"

import { useState } from "react"

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  label: string
  description?: string
  period: "night" | "morning" | "afternoon" | "evening"
}

export interface WorkdayTimelineProps {
  slots?: TimeSlot[]
  title?: string
  date?: string
}

const DEFAULT_SLOTS: TimeSlot[] = [
  {
    id: "0a",
    startTime: "0:00",
    endTime: "7:00",
    label: "Sleep",
    description: "Rest and recovery",
    period: "night",
  },
  {
    id: "1",
    startTime: "7:00",
    endTime: "8:00",
    label: "Morning Routine",
    description: "Exercise, breakfast, and prep",
    period: "morning",
  },
  {
    id: "2",
    startTime: "8:00",
    endTime: "9:30",
    label: "Deep Work",
    description: "Focused coding or writing session",
    period: "morning",
  },
  {
    id: "3",
    startTime: "9:30",
    endTime: "10:00",
    label: "Standup",
    description: "Team sync and daily planning",
    period: "morning",
  },
  {
    id: "4",
    startTime: "10:00",
    endTime: "12:00",
    label: "Deep Work",
    description: "Project work, no interruptions",
    period: "morning",
  },
  {
    id: "5",
    startTime: "12:00",
    endTime: "13:00",
    label: "Lunch Break",
    description: "Walk, rest, and recharge",
    period: "afternoon",
  },
  {
    id: "6",
    startTime: "13:00",
    endTime: "14:30",
    label: "Meetings",
    description: "1:1s, reviews, and collaboration",
    period: "afternoon",
  },
  {
    id: "7",
    startTime: "14:30",
    endTime: "16:30",
    label: "Shallow Work",
    description: "Email, docs, code reviews",
    period: "afternoon",
  },
  {
    id: "8",
    startTime: "16:30",
    endTime: "17:00",
    label: "Wind Down",
    description: "Wrap up tasks and plan tomorrow",
    period: "afternoon",
  },
  {
    id: "9",
    startTime: "17:00",
    endTime: "19:00",
    label: "Personal Time",
    description: "Hobbies, reading, or side projects",
    period: "evening",
  },
  {
    id: "10",
    startTime: "19:00",
    endTime: "21:00",
    label: "Evening",
    description: "Dinner, family time, relaxation",
    period: "evening",
  },
  {
    id: "0b",
    startTime: "21:00",
    endTime: "24:00",
    label: "Sleep",
    description: "Rest and recovery",
    period: "night",
  },
]

const PERIOD_META = {
  night: {
    label: "Night",
    barClass: "bg-neutral-200 dark:bg-neutral-700",
    badgeClass: "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300",
    dotClass: "bg-neutral-200 dark:bg-neutral-700",
  },
  morning: {
    label: "Morning",
    barClass: "bg-neutral-900 dark:bg-neutral-100",
    badgeClass: "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900",
    dotClass: "bg-neutral-900 dark:bg-neutral-100",
  },
  afternoon: {
    label: "Afternoon",
    barClass: "bg-neutral-500",
    badgeClass: "bg-neutral-500 text-white",
    dotClass: "bg-neutral-500",
  },
  evening: {
    label: "Evening",
    barClass: "bg-neutral-300 dark:bg-neutral-600",
    badgeClass: "bg-neutral-300 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100",
    dotClass: "bg-neutral-300 dark:bg-neutral-600",
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
  const end = timeToMinutes(slot.endTime)
  const leftPct = (start / DAY_DURATION) * 100
  const widthPct = ((end - start) / DAY_DURATION) * 100
  const meta = PERIOD_META[slot.period]

  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`${slot.label}, ${slot.startTime} to ${slot.endTime}`}
      className="absolute top-0 h-full group focus:outline-none"
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
    >
      <div
        className={`
          mx-px h-full rounded-sm transition-all duration-200
          ${meta.barClass}
          ${isActive ? "opacity-100 scale-y-110" : "opacity-80 group-hover:opacity-100"}
        `}
      />
    </button>
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
  title = "My Workday",
  date,
}: WorkdayTimelineProps) {
  const [activeId, setActiveId] = useState<string | null>(slots[0]?.id ?? null)
  const activeSlot = slots.find((s) => s.id === activeId) ?? null

  const ticks = [0, 3, 6, 9, 12, 15, 18, 21]

  const periods = (["night", "morning", "afternoon", "evening"] as const).map((p) => ({
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
              key={slot.id}
              slot={slot}
              isActive={activeId === slot.id}
              onClick={() => setActiveId(activeId === slot.id ? null : slot.id)}
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
              <span className="block mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 leading-none">{activeSlot.description}</span>
            )}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">Click a segment.</p>
        )}
      </div>

      {/* Mobile list */}
      <div className="mt-3 sm:hidden" aria-label="All time slots">
        <ol className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {slots.map((slot) => {
            const meta = PERIOD_META[slot.period]
            return (
              <li key={slot.id} className="flex items-start gap-2 py-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dotClass}`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">{slot.label}</p>
                  <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                    {slot.startTime} – {slot.endTime}
                  </p>
                  {slot.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{slot.description}</p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </figure>
  )
}
