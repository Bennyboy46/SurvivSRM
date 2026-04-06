"use client";

import { useMemo, useState } from "react";

type TableSlot = {
  code?: string;
  name?: string;
  slot?: string;
  roomNo?: string;
};

type DaySchedule = {
  day?: number;
  table?: Array<TableSlot | null>;
};

interface DayOrderNavbarProps {
  schedule?: DaySchedule[];
  batch?: string;
}

const DAY_ORDERS = [1, 2, 3, 4, 5];
const SLOT_TIMINGS = [
  "08:00 - 08:50",
  "08:50 - 09:40",
  "09:45 - 10:35",
  "10:40 - 11:30",
  "11:30 - 12:20",
  "12:30 - 13:20",
  "13:20 - 14:15",
  "14:20 - 15:10",
  "15:10 - 16:00",
  "16:00 - 16:50",
];

export default function DayOrderNavbar({ schedule = [], batch }: DayOrderNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scheduleMap = useMemo(() => {
    const mapped = new Map<number, DaySchedule>();
    for (const item of schedule) {
      if (typeof item.day === "number") {
        mapped.set(item.day, item);
      }
    }
    return mapped;
  }, [schedule]);

  const populatedDayCount = useMemo(
    () => DAY_ORDERS.filter((day) => (scheduleMap.get(day)?.table ?? []).some(Boolean)).length,
    [scheduleMap]
  );

  const columnCount = useMemo(() => {
    const maxSlots = schedule.reduce((max, item) => {
      const length = Array.isArray(item?.table) ? item.table.length : 0;
      return Math.max(max, length);
    }, 0);
    return maxSlots > 0 ? maxSlots : 10;
  }, [schedule]);

  const slotHints = useMemo(() => {
    return Array.from({ length: columnCount }, (_, index) => {
      for (const day of DAY_ORDERS) {
        const slot = scheduleMap.get(day)?.table?.[index] as TableSlot | null | undefined;
        if (slot?.slot) return slot.slot;
      }
      return "-";
    });
  }, [columnCount, scheduleMap]);

  const slotTimings = useMemo(() => {
    return Array.from({ length: columnCount }, (_, index) => SLOT_TIMINGS[index] ?? "Timing unavailable");
  }, [columnCount]);

  return (
    <nav className="glass-card animate-fade-in" style={{ borderRadius: "20px", padding: "0.8rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow" style={{ margin: 0 }}>Day Order Timetable</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {populatedDayCount}/5 days mapped{batch ? ` • Batch ${batch}` : ""}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="chip chip--solid"
          style={{ cursor: "pointer" }}
        >
          {isOpen ? "Hide timetable" : "Open timetable"}
        </button>
      </div>

      {isOpen && (
        <div className="surface-soft" style={{ marginTop: "0.7rem", borderRadius: "14px", padding: "0.65rem 0.75rem" }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "0.55rem" }}>
            Slot layout is auto-detected from backend timetable for your batch.
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px", fontSize: "0.78rem" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "0.45rem", background: "rgba(255,255,255,0.04)", textAlign: "left" }}>
                    Day Order
                  </th>
                  {Array.from({ length: columnCount }, (_, idx) => (
                    <th
                      key={`slot-head-${idx}`}
                      style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "0.45rem", background: "rgba(255,255,255,0.04)", textAlign: "left", minWidth: "150px" }}
                    >
                      <div style={{ fontWeight: 700 }}>{`Slot ${idx + 1}`}</div>
                      <div style={{ fontSize: "0.67rem", color: "var(--text-secondary)", marginTop: "0.18rem" }}>{`Time: ${slotTimings[idx]}`}</div>
                      <div style={{ fontSize: "0.67rem", color: "var(--text-muted)", marginTop: "0.18rem" }}>{`Label: ${slotHints[idx]}`}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {DAY_ORDERS.map((day) => {
                  const dayTable = scheduleMap.get(day)?.table ?? [];

                  return (
                    <tr key={`day-row-${day}`}>
                      <td style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "0.45rem", fontWeight: 700, whiteSpace: "nowrap", background: "rgba(0,180,216,0.1)" }}>
                        Day {day}
                      </td>

                      {Array.from({ length: columnCount }, (_, slotIdx) => {
                        const rawSlot = dayTable[slotIdx] ?? null;
                        const slot = (rawSlot && typeof rawSlot === "object") ? (rawSlot as TableSlot) : null;

                        return (
                          <td key={`day-${day}-slot-${slotIdx}`} style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "0.45rem", verticalAlign: "top", background: slot ? "rgba(0,119,182,0.12)" : "rgba(255,255,255,0.02)" }}>
                            {slot ? (
                              <>
                                <div style={{ fontWeight: 600, lineHeight: 1.35 }}>{slot.name ?? slot.code ?? "Class"}</div>
                                <div style={{ fontSize: "0.67rem", color: "var(--text-muted)", marginTop: "0.22rem" }}>
                                  {slot.slot ? `Mapped slot: ${slot.slot}` : "Mapped slot: -"}
                                </div>
                                {slot.roomNo && (
                                  <div style={{ fontSize: "0.67rem", color: "var(--text-secondary)", marginTop: "0.18rem" }}>
                                    {`Classroom: ${slot.roomNo}`}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Free</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </nav>
  );
}