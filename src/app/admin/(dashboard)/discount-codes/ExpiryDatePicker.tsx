"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

const MONTHS = [
  { value: 1, label: "يناير" },
  { value: 2, label: "فبراير" },
  { value: 3, label: "مارس" },
  { value: 4, label: "أبريل" },
  { value: 5, label: "مايو" },
  { value: 6, label: "يونيو" },
  { value: 7, label: "يوليو" },
  { value: 8, label: "أغسطس" },
  { value: 9, label: "سبتمبر" },
  { value: 10, label: "أكتوبر" },
  { value: 11, label: "نوفمبر" },
  { value: 12, label: "ديسمبر" },
];

type Preset = "none" | "week" | "month" | "quarter" | "year" | "custom";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function fromDate(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function ExpiryDatePicker() {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [preset, setPreset] = useState<Preset>("none");
  const [year, setYear] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [day, setDay] = useState<number | "">("");

  const years = useMemo(() => {
    const start = today.getFullYear();
    return Array.from({ length: 6 }, (_, i) => start + i);
  }, [today]);

  const daysInMonth = useMemo(() => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  const applyDate = (date: Date, nextPreset: Preset) => {
    const parts = fromDate(date);
    setYear(parts.year);
    setMonth(parts.month);
    setDay(parts.day);
    setPreset(nextPreset);
  };

  const clearDate = () => {
    setYear("");
    setMonth("");
    setDay("");
    setPreset("none");
  };

  const handleYear = (value: number | "") => {
    setYear(value);
    setPreset("custom");
    if (value && month && day) {
      const max = new Date(value, month, 0).getDate();
      if (day > max) setDay(max);
    }
  };

  const handleMonth = (value: number | "") => {
    setMonth(value);
    setPreset("custom");
    if (year && value && day) {
      const max = new Date(year, value, 0).getDate();
      if (day > max) setDay(max);
    }
  };

  const isoValue =
    year && month && day ? toIso(year, month, Math.min(day, daysInMonth)) : "";

  const formatted =
    year && month && day
      ? new Date(year, month - 1, Math.min(day, daysInMonth)).toLocaleDateString("ar-EG", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "بدون تاريخ انتهاء";

  const selectClass =
    "w-full px-3 py-3 bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all appearance-none text-center font-medium";

  const chipClass = (active: boolean) =>
    `px-3 py-2 rounded-full text-sm font-semibold border transition-all ${
      active
        ? "bg-accent text-black border-accent"
        : "bg-background text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
    }`;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-foreground">تاريخ الانتهاء</label>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={chipClass(preset === "none")} onClick={clearDate}>
          بدون انتهاء
        </button>
        <button
          type="button"
          className={chipClass(preset === "week")}
          onClick={() => applyDate(addDays(today, 7), "week")}
        >
          أسبوع
        </button>
        <button
          type="button"
          className={chipClass(preset === "month")}
          onClick={() => applyDate(addDays(today, 30), "month")}
        >
          شهر
        </button>
        <button
          type="button"
          className={chipClass(preset === "quarter")}
          onClick={() => applyDate(addDays(today, 90), "quarter")}
        >
          3 أشهر
        </button>
        <button
          type="button"
          className={chipClass(preset === "year")}
          onClick={() => applyDate(addDays(today, 365), "year")}
        >
          سنة
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="block text-xs text-muted-foreground mb-1.5 text-center">اليوم</span>
          <select
            value={day}
            onChange={(e) => {
              setDay(e.target.value ? Number(e.target.value) : "");
              setPreset("custom");
            }}
            className={selectClass}
          >
            <option value="">—</option>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground mb-1.5 text-center">الشهر</span>
          <select
            value={month}
            onChange={(e) => handleMonth(e.target.value ? Number(e.target.value) : "")}
            className={selectClass}
          >
            <option value="">—</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground mb-1.5 text-center">السنة</span>
          <select
            value={year}
            onChange={(e) => handleYear(e.target.value ? Number(e.target.value) : "")}
            className={selectClass}
          >
            <option value="">—</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-muted/40 border border-border px-3 py-2.5 text-sm">
        <CalendarDays className="w-4 h-4 text-accent shrink-0" />
        <span className={isoValue ? "text-foreground" : "text-muted-foreground"}>{formatted}</span>
      </div>

      <input type="hidden" name="expiryDate" value={isoValue} />
    </div>
  );
}
