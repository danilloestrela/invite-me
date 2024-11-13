import { twMerge } from "tailwind-merge";
import CountdownTimer, { CountdownTimerProps } from "./Countdown/Countdown";

interface PartyCountdownProps extends Partial<CountdownTimerProps> {
    targetDateString?: string;
    endMessage?: string;
    outerBoxClassName?: string;
}
export function PartyCountdown({ outerBoxClassName, targetDateString, endMessage, children, ...props }: PartyCountdownProps) {
    const classNames = twMerge("flex flex-col gap-2 items-center bg-white p-4 rounded-lg border border-black opacity-80", outerBoxClassName);
  return (
    <div className={classNames}>
        {children}
        <CountdownTimer className="text-4xl lg:text-[40px] font-bold" endMessage={endMessage || "É hoje! 🎉"} targetDateString={targetDateString || "January 31, 2060 00:00:00"} {...props} />
    </div>
  );
}