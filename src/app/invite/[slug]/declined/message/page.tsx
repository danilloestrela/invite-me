'use client';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Location } from '@/components/Location';
import { DeclinedMessageSkeleton } from '@/components/modules/invite/Skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
  const slug = params.slug;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { guest, updateGuestMutation, guestEnum, isLoading } = useGuest(slug as string);

  const isDeclinedMessagePending = guest?.data?.status === guestEnum.not_attending_message_pending;

  if (!isDeclinedMessagePending && guest?.data?.status && !updateGuestMutation?.isPending) {
    const redirectTo = checkNextStep({ slug: slug as string, status: guest?.data?.status as GuestStatusEnum });
    if (redirectTo) redirect(redirectTo);
    return <DeclinedMessageSkeleton />;
  }

  const handleCode = (inputCode: string) => {
    if (inputCode.length > 4) return;
    setCode(inputCode.toUpperCase().trim());
  };

  const handleMessageChange = (message: string) => {
    queryClient.setQueryData(['guest', slug], (oldData: GuestData | undefined) => {
      if (!oldData?.data) return oldData;
      return {
        data: {
          ...oldData.data,
          message: message,
        },
      };
    });
  };

  const handleMessageSubmit = () => {
    if (!guest?.data?.message) return;
    if (guest?.data?.message.length < 25) {
      toast({
        title: 'Atenção!',
        description: 'A mensagem não pode ter menos de 25 caracteres.',
      });
      return;
    }
    updateGuestMutation.mutate({ slug: slug as string, fields: [{ message: guest?.data?.message }, { status: guestEnum.not_attending }] });
  };

  if (!isLoading && !updateGuestMutation?.isPending && guest?.data) {
    return (
      <>
        {guest && (
          <div className="flex flex-col items-start justify-center gap-4 h-full">
            <h1 className="font-heading text-4xl"> Tudo bem, não se preocupe! <br /> Quer deixar alguma mensagem?</h1>
            <p className="text-sm text-gray-500">A mensagem é opcional, mas ficaria muito feliz de saber mais sobre o motivo.</p>
            <div className="bg-white border-black border-[1px] rounded flex w-full p-2">
              <Textarea
                className='border-0 focus-visible:ring-0'
                placeholder="Deixar mensagem ou explicar o motivo (opcional)"
                value={guest?.data?.message}
                onChange={(e) => handleMessageChange(e.target.value)}
              />
              <ConfirmationDialog
                title="Deseja enviar a mensagem?"
                description={
                  <>
                    <span className="font-bold">Mensagem:</span> {guest?.data?.message}
                    <br />
                    Para confirmar a mensagem, digite o código do convite:
                    <Input type="text" placeholder="XXXX" value={code} onChange={(e) => handleCode(e.target.value)} />
                  </>
                }
                onConfirm={handleMessageSubmit}
                onCancel={() => {}}
              >
                <Button className="hover:bg-gray-600">Enviar</Button>
              </ConfirmationDialog>
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

  return <DeclinedMessageSkeleton />;
}
