'use client';
import { Location } from '@/components/Location';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Guest } from '@/lib/GoogleSheetsService';

interface Data {
  data: Guest;
}

export default function Page() {
  const params = useParams();
  const guest = true;
  const skeletonStyles = "bg-gray-300"

  return (
    <>
    {!guest && (
      <div className="flex flex-col gap-4">
        <Skeleton className={`w-96 h-10 ${skeletonStyles}`} />
        <Skeleton className={`w-80 h-10 ${skeletonStyles}`} />
        <Skeleton className={`w-full h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-60 h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-96 h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
      </div>
    )}
    {guest && (
        <div className="flex flex-col items-start justify-center gap-4 h-full">
          <h1 className="font-heading text-4xl"> Entendo... <br /> Quer deixar alguma mensagem?</h1>
          <p className="text-sm text-gray-500">A mensagem é opcional, mas ficaria muito feliz de saber mais sobre o motivo.</p>
          <div className="bg-white border-black border-[1px] rounded flex w-full p-2">
            <Textarea
              className='border-0 focus-visible:ring-0'
              placeholder="Deixar mensagem ou explicar o motivo (opcional)"
            />
            <Button className="hover:bg-gray-600">Enviar</Button>
          </div>

          <Location
            title="Domus Hall"
            time="22 horas"
            address="Av. Gov. Flávio Ribeiro Coutinho, 220 - Lot. Oceania II, João Pessoa - PB, 58102-835"
            href="https://g.co/kgs/nJH1zfG"
          />
        </div>
      )}
    </>
  );
}
