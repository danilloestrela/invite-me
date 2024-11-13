'use client';
import { Location } from '@/components/Location';
import { PartyCountdown } from '@/components/PartyCountdown';
import { Skeleton } from '@/components/ui/skeleton';
import { Guest } from '@/lib/GoogleSheetsService';
import { useState } from 'react';

interface Data {
  data: Guest;
}

export default function Page() {
  // const params = useParams();
  const [guest, setGuest] = useState<Data | null>({data :{ id: '', name: 'Fulano de tal', email: '', phone: '', accepted: false }});
  const skeletonStyles = "bg-gray-300"

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuest({...guest, data: {...guest.data, name: e.target.value}});
  }

  return (
    <>
    {!guest && (
      <div className="flex flex-col gap-4">
        <Skeleton className={`w-80 h-10 ${skeletonStyles}`} />
        <Skeleton className={`w-96 h-10 ${skeletonStyles}`} />
        <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
        <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
      </div>
    )}
    {guest && (
        <div className="flex flex-col items-start justify-center gap-4 h-full">
          <h1 className="font-heading text-4xl"> Obrigado pelas confirmações! <br /> Te aguardo 31 de janeiro de 2025</h1>
          <p className="text-justify">
            Será <span className="font-bold"> um prazer te receber nesta comemoração!</span>
            <br />
            <span className="font-bold"> Salve o link desta página</span> para consultar futuramente.
          </p>
          <Location
            title="Domus Hall"
            time="21 horas"
            address="Av. Gov. Flávio Ribeiro Coutinho, 220 - Lot. Oceania II, João Pessoa - PB, 58102-835"
            href="https://g.co/kgs/nJH1zfG"
          />
          <PartyCountdown outerBoxClassName="w-full" targetDateString="January 31, 2025 00:00:00" />
        </div>
      )}
    </>
  );
}
