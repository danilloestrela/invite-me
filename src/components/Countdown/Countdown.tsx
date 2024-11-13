"use client";
import { isPast } from "date-fns";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface CountdownTimerProps extends React.HTMLAttributes<HTMLParagraphElement> {
  onLoadingChange?: (loading: boolean) => void;
  targetDateString?: string | null;
  endMessage?: string | null;
}

export default function CountdownTimer({ targetDateString = null, endMessage = null, className, onLoadingChange, ...rest }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);
  const classNames = twMerge("text-center font-mono", className);
  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  useEffect(() => {
    const targetDate = new Date(targetDateString || "January 31, 2025 00:00:00");

    const countdown = setInterval(() => {
      const now = new Date();

      if (isPast(targetDate)) {
        clearInterval(countdown);
        setTimeLeft(endMessage || "A festa de formatura começou! 🎉");
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      } else {
        const totalSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);

        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = formatNumber(Math.floor((totalSeconds % (3600 * 24)) / 3600));
        const minutes = formatNumber(Math.floor((totalSeconds % 3600) / 60));
        const seconds = formatNumber(totalSeconds % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        if (loading) {
          setLoading(false);
          if (onLoadingChange) onLoadingChange(false);
        }
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [loading, onLoadingChange, endMessage, targetDateString]);

  return (
    <p
      className={classNames}
      {...rest}
    >
      {timeLeft}
    </p>
  );
}