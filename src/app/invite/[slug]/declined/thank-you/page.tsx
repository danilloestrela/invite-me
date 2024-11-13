'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { Guest } from '@/lib/GoogleSheetsService';

interface Data {
  data: Guest;
}

export default function Page() {
  const guest = true;
  const skeletonStyles = "bg-gray-300"


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
          <h1 className="font-heading text-4xl"> Obrigado pela confirmação!</h1>
          <p className="text-justify">
            Entendo que não é sempre que podemos comparecer e agradeço por ter me confirmado com antecedência, {guest.data.name}!
            <br />
            Caso precise de alguma informação, pode entrar em contato comigo pelo whatsapp.
          </p>
        </div>
      )}
    </>
  );
}
