"use client";

export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full h-2.5 bg-muted rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-l from-gold to-gold-deep rounded-full transition-all"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
