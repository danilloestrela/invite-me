'use client';
import CanConfirmFor from '@/components/modules/invite/CanConfirmFor';
import { DeclinedThankYouSkeleton } from '@/components/modules/invite/Skeletons';
import { useGuest } from '@/hooks/useGuest';
import { GuestStatusEnum, MergedGuest } from '@/lib/GoogleSheetsService';
import { checkNextStep } from '@/lib/StepService';
import { formatDistanceToNow, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { redirect, useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const slug = params.slug;
  const { guest, isLoading, guestEnum } = useGuest(slug as string);

  if (guest?.data?.status !== guestEnum.not_attending) {
    const redirectTo = checkNextStep({ slug: slug as string, status: guest?.data?.status as GuestStatusEnum });
    if (redirectTo) redirect(redirectTo);
    return <DeclinedThankYouSkeleton />;
  }

  const getTimeAgo = () => {
    const updatedAt = guest?.data?.updated_at;
    const timezone = 'America/Recife';
    const parsedDate = parse(updatedAt!, 'dd/MM/yyyy HH:mm:ss', new Date());
    const zonedDate = toZonedTime(parsedDate, timezone);
    return formatDistanceToNow(zonedDate, { addSuffix: true, locale: ptBR });
  }

  if (!isLoading && guest?.data) {
    const doneTimeAgo = getTimeAgo();
    return (guest?.data && (
      <div className="flex flex-col items-start justify-center gap-4 h-full">
        <h1 className="font-heading text-4xl"> Obrigado pela confirmação!</h1>
        <p className="text-justify">
          Entendo que não é sempre que podemos comparecer e agradeço por ter me confirmado com antecedência, {guest.data.name.split(' ')[0]}!
          <br />
          Caso precise de alguma informação, pode entrar em contato comigo pelo whatsapp.
          <br />
        </p>
        <p className="text-sm text-gray-500">
          Você realizou essa ação {doneTimeAgo}
        </p>
        {guest?.data?.can_confirm && (
          <div className="w-full">
            <h3 className="text-lg font-bold">Você também pode confirmar para:</h3>
            <CanConfirmFor guests={guest?.data?.can_confirm as MergedGuest[]} fromGuestId={guest?.data?.id} />
          </div>
        )}
      </div>
    ));
  }

  return <DeclinedThankYouSkeleton />;
}
