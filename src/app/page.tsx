import { PartyCountdown } from "@/components/PartyCountdown";
import { partyDate } from "@/constants/defaults";
import Danillo from "@public/assets/danillo.png";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start h-full">
      <div className="flex gap-8 h-full relative">
        <div className="relative w-auto h-screen">
          <Image
            src={Danillo}
            alt="Na imagem, Danillo Estrela formando em medicina"
            className="h-screen w-auto object-cover"
          />
        </div>
        <section className="w-1/2 pt-[5%]">
          <div className="flex flex-col gap-2  max-w-[600px]">
            <h1 className="text-4xl font-heading">Danillo Estrela formou em Medicina</h1>
            <p className="font-sans text-sm">

            </p>
            <PartyCountdown outerBoxClassName="w-full" targetDateString={partyDate}>
              <h2 className="text-xl font-bold">Vamos festejar juntos em 31 de Janeiro de 2024</h2>
            </PartyCountdown>
          </div>
        </section>
      </div>
    </main>
  );
}
