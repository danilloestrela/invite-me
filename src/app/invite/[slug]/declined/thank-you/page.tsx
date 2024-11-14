'use client';
import { DeclinedThankYouSkeleton } from '@/components/modules/invite/Skeletons';
import { useGuest } from '@/hooks/useGuest';
import { GuestStatusEnum } from '@/lib/GoogleSheetsService';
import { checkNextStep } from '@/lib/StepService';
import { formatDistanceToNow, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { redirect, useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const slug = params.slug;
  const { guest, isLoading, guestEnum } = useGuest(slug as string);

  if(guest?.data?.status !== guestEnum.not_attending) {
    const redirectTo = checkNextStep({ slug: slug as string, status: guest?.data?.status as GuestStatusEnum });
    if (redirectTo) redirect(redirectTo);
    return <DeclinedThankYouSkeleton />;
  }

  if (!isLoading && guest?.data) {
    return ( guest?.data && (
      <div className="flex flex-col items-start justify-center gap-4 h-full">
        <h1 className="font-heading text-4xl"> Obrigado pela confirmação!</h1>
        <p className="text-justify">
          Entendo que não é sempre que podemos comparecer e agradeço por ter me confirmado com antecedência, {guest.data.name.split(' ')[0]}!
          <br />
          Caso precise de alguma informação, pode entrar em contato comigo pelo whatsapp.
          <br />
        </p>
        <p className="text-sm text-gray-500">
          Você realizou essa ação {formatDistanceToNow(parse(guest?.data?.updated_at, 'dd/MM/yyyy HH:mm:ss', new Date()), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
    ));
}

return <DeclinedThankYouSkeleton />;
}
