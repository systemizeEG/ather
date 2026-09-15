"use client";

import { useMemo, useState } from "react";

type Preset = "none" | "week" | "month" | "quarter" | "year" | "custom";

function toIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function ExpiryDatePicker() {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [preset, setPreset] = useState<Preset>("none");
  const [value, setValue] = useState("");

  const apply = (date: Date, nextPreset: Preset) => {
    setValue(toIso(date));
    setPreset(nextPreset);
  };

  const chip = (id: Preset, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
        preset === id
          ? "bg-gold text-truffle border-gold"
          : "bg-background text-muted-foreground border-border hover:border-gold/50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold">تاريخ الانتهاء</label>
      <div className="flex flex-wrap gap-2">
        {chip("none", "بدون انتهاء", () => {
          setValue("");
          setPreset("none");
        })}
        {chip("week", "أسبوع", () => apply(addDays(today, 7), "week"))}
        {chip("month", "شهر", () => apply(addDays(today, 30), "month"))}
        {chip("quarter", "3 أشهر", () => apply(addDays(today, 90), "quarter"))}
      </div>
      <input
        type="date"
        min={toIso(today)}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setPreset(e.target.value ? "custom" : "none");
        }}
        className="w-full h-11 rounded-xl border border-gold/30 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
      <input type="hidden" name="expiryDate" value={value} />
    </div>
  );
}
