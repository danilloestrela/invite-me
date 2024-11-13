import Domus from "@public/assets/domus.jpg";
import { MapPin } from "lucide-react";
import Image from "next/image";

interface LocationProps {
  title: string;
  time: string;
  address: string;
  href: string;
}
export function Location({ title, time, address, href }: LocationProps) {
  return (
    <div className="flex flex-row gap-4 items-center bg-white p-3 rounded-lg border border-black opacity-80 w-full">
      <div className="flex flex-grow flex-row items-center w-[150px] h-full md:w-[180px] lg:h-[100px] relative group cursor-pointer">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-0 left-0 right-0 bottom-0 w-auto h-auto z-10 bg-black rounded-sm flex flex-grow opacity-0 group-hover:opacity-100 transition-all duration-300 items-center justify-center"
        >
          <MapPin className="w-10 h-10 text-white" />
        </a>
        <Image src={Domus} alt="Domus Hall" width={100} height={100} className="w-full rounded group-hover:blur-sm" />
      </div>
      <div className="text-xs xs:text-sm xl:text-base w-full">
        <p><span className="font-bold">Horário:</span> {time}</p>
        <p><span className="font-bold">Local:</span> {title}</p>
        <p>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <span className="font-bold">Endereço:</span> {address}
          </a>
        </p>
      </div>
    </div>
  );
}