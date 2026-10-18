"use client";

export function DaySeparator({ label }: { label: string }) {
  return (
    <div className="sticky top-2 z-10 my-2.5 flex justify-center pointer-events-none">
      <span
        className="inline-flex items-center rounded-full border border-white/15 px-3.5 py-1 text-[12px] font-bold tracking-wide text-white shadow-md backdrop-blur-md select-none"
        style={{ backgroundColor: "var(--tg-bg-pill)" }}
      >
        {label}
      </span>
    </div>
  );
}
