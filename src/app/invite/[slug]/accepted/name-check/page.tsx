'use client';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Location } from '@/components/Location';
import { NameCheckSkeleton } from '@/components/modules/invite/Skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useGuest } from '@/hooks/useGuest';
import { GuestData } from '@/lib/api/mutations';
import { GuestStatusEnum } from '@/lib/GoogleSheetsService';
import { checkNextStep } from '@/lib/StepService';
import { useQueryClient } from '@tanstack/react-query';
import { redirect, useParams } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const [code, setCode] = useState('');
  const params = useParams();
  const queryClient = useQueryClient();
  const slug = params.slug;
  const { guest, isLoading, updateGuestMutation, guestEnum } = useGuest(slug as string);
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    queryClient.setQueryData(['guest', slug], (oldData: GuestData | undefined) => {
      if (!oldData?.data) return oldData;
      return {
        data: {
          ...oldData.data,
          name: e.target.value,
        },
      };
    });
  };

  const handleConfirmation = () => {
    if (!guest?.data?.name) return;
    if (code.length !== 4 || code !== guest?.data?.code) {
      toast({
        title: 'Atenção!',
        description: 'Digite o código corretamente.',
      });
      return;
    }
    updateGuestMutation.mutate({ slug: slug as string, fields: [{ name: guest.data.name }, { status: guestEnum.attending }] });
  };

  const handleCode = (inputCode: string) => {
    if (inputCode.length > 4) return;
    setCode(inputCode.toUpperCase().trim());
  };

  const isAttendingNameCheckPending = guest?.data?.status === guestEnum.attending_name_check_pending;

  if (!isAttendingNameCheckPending && guest?.data?.status && !updateGuestMutation.isPending) {
    const redirectTo = checkNextStep({ slug: slug as string, status: guest?.data?.status as GuestStatusEnum });
    if (redirectTo) redirect(redirectTo);
    return <NameCheckSkeleton />;
  }


  if (!isLoading && !updateGuestMutation?.isPending && guest?.data) {
    return (
      <>
        <div className="flex flex-col items-start justify-center gap-4 h-full">
          <h1 className="font-heading text-4xl">Que maravilha! Confirmado! <br /> Só mais uma coisa...</h1>
          <p className="text-justify">
            Somos humanos, cometemos erros... Poderia confirmar <span className="font-bold">se seu nome completo está correto?</span>
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">{guest?.data?.name || ''}</p>
          </div>
          <p className="text-sm text-gray-500">
            Caso não esteja, por favor, corrija digitando seu nome completo abaixo.
          </p>
          <div className="bg-white border-black border-[1px] rounded flex w-full p-2">
            <Input
              type="text"
              className="border-0 focus-visible:ring-0"
              placeholder="Nome completo"
              value={guest.data?.name}
              onChange={handleNameChange}
            />
            <ConfirmationDialog
              title="Confira o seu nome. Está correto?"
              description={
                <>
                  O nome a confirmar é: <span className="font-bold">{guest.data?.name}</span>
                  <br />
                  <br />
                  <span className="text-sm text-gray-500">
                    Digite o código do convite para confirmar:
                  </span>
                  <Input
                    type="text"
                    className="border-0 focus-visible:ring-0"
                    placeholder="XXXX"
                    value={code}
                    onChange={(e) => handleCode(e.target.value)}
                  />
                </>
              }
              confirmLabel="Tudo certo, pode confirmar!"
              onConfirm={handleConfirmation}
              onCancel={() => setCode('')}
            >
              <Button className="hover:bg-gray-600">Confirmar</Button>
            </ConfirmationDialog>
          </div>
          <Location
            title="Domus Hall"
            time="22 horas"
            address="Av. Gov. Flávio Ribeiro Coutinho, 220 - Lot. Oceania II, João Pessoa - PB, 58102-835"
            href="https://g.co/kgs/nJH1zfG"
          />
        </div>
      </>
    );
  }

  return <NameCheckSkeleton />;

}
