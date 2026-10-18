"use client";

export function ChatListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Caricamento chat" className="divide-y divide-tg-border">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="flex h-[72px] items-center gap-3 px-2.5 animate-pulse"
        >
          <div className="h-[54px] w-[54px] shrink-0 rounded-full bg-tg-hover" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 rounded bg-tg-hover" />
              <div className="h-2.5 w-10 rounded bg-tg-hover" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-44 rounded bg-tg-hover" />
              <div className="h-4 w-5 rounded-full bg-tg-hover" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageStreamSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Caricamento elementi"
      className="mx-auto flex w-full max-w-[780px] flex-col gap-2.5 p-4"
    >
      {Array.from({ length: count }).map((_, idx) => {
        const isOut = idx % 2 === 1;
        return (
          <div
            key={idx}
            className={`flex items-end gap-2 ${isOut ? "justify-end" : "justify-start"}`}
          >
            {!isOut && (
              <div className="h-9 w-9 shrink-0 rounded-full bg-tg-surface animate-pulse" />
            )}
            <div
              className={`w-full max-w-[420px] rounded-[12px] p-3 animate-pulse ${
                isOut ? "bg-tg-bubble-out" : "bg-tg-bubble-in"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="h-3.5 w-32 rounded bg-tg-hover" />
                <div className="h-3 w-12 rounded bg-tg-hover" />
              </div>
              <div className="mt-2.5 h-3 w-56 rounded bg-tg-hover" />
              <div className="mt-2 flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-tg-hover" />
                <div className="h-2.5 w-12 rounded bg-tg-hover" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
