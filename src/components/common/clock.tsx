import { useEffect, useState } from "react";

export default function Clock() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Kolkata",
  });

  const [time, setTime] = useState(() => {
    return formatter.format(new Date());
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatter.format(new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <p>india</p>
      <span>•</span>
      <p className="text-muted-foreground font-medium">{time}</p>
    </div>
  );
}
