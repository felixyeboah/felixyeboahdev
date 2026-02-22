"use client";

import { useEffect, useState } from "react";

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return <span>--:--:--</span>;

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");

  return (
    <span className="tabular-nums">
      {hh}:{mm}
      <span className="animate-blink">:{ss}</span>
    </span>
  );
}
