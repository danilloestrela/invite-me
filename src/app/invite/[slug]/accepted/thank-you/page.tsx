'use client';
import { Location } from '@/components/Location';
import CanConfirmFor from '@/components/modules/invite/CanConfirmFor';
import { AcceptedThankYouSkeleton } from '@/components/modules/invite/Skeletons';
import { PartyCountdown } from '@/components/PartyCountdown';
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

  if (guest?.data && guest?.data?.status !== guestEnum.attending) {
    const redirectTo = checkNextStep({ slug: slug as string, status: guest?.data?.status as GuestStatusEnum });
    if (redirectTo) redirect(redirectTo);
    return <AcceptedThankYouSkeleton />;
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
    return (
      <>
        {guest?.data && (
          <div className="flex flex-col items-start justify-center gap-4 h-full">
            <h1 className="font-heading text-4xl">Obrigado pela confirmação! <br /> Te aguardo 31 de janeiro de 2025</h1>
            <p className="text-justify">
              Será <span className="font-bold"> um prazer te receber nesta comemoração!</span>
              <br />
              <span className="font-bold"> Salve o link desta página</span> para consultar futuramente.
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">
                {guest?.data?.name}, você aceitou o convite {doneTimeAgo}.
              </p>
            </div>
            <Location
              title="Domus Hall"
              time="22 horas"
              address="Av. Gov. Flávio Ribeiro Coutinho, 220 - Lot. Oceania II, João Pessoa - PB, 58102-835"
              href="https://g.co/kgs/nJH1zfG"
            />
            {guest?.data?.can_confirm && (
              <div className="w-full">
                <h3 className="text-lg font-bold">Você também pode confirmar para:</h3>
                <CanConfirmFor guests={guest?.data?.can_confirm as MergedGuest[]} fromGuestId={guest?.data?.id} />
              </div>
            )}
            <PartyCountdown outerBoxClassName="w-full" targetDateString="January 31, 2025 00:00:00" />
          </div>
        )}
      </>
    );
  }

  return <AcceptedThankYouSkeleton />;
}
