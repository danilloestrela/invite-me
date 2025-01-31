'use client';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { InviteSkeleton } from '@/components/modules/invite/Skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GuestStatus } from '@/constants/general';
import { useToast } from '@/hooks/use-toast';
import { useGuest } from '@/hooks/useGuest';
import { checkNextStep } from '@/lib/StepService';
import { redirect, useParams } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const [code, setCode] = useState('');
  const params = useParams();
  const { toast } = useToast();
  const slug = params.slug;
  const { guest, isLoading, updateGuestMutation, validateCodeMutation } = useGuest(slug as string);

  const handlePresenceAction = async (action: boolean = false) => {
    if (!guest?.data?.id) {
      toast({
        title: 'Erro!',
        description: 'ID do convidado não encontrado.',
      });
      return;
    }
    const status = action ? GuestStatus.attending_name_check_pending : GuestStatus.not_attending_message_pending;
    const isCodeValid = await validateCodeMutation.mutateAsync({ guestId: slug as string, code });
    if (!isCodeValid) {
      toast({
        title: 'Atenção!',
        description: 'Digite o código corretamente.',
      });
      return;
    }
    updateGuestMutation.mutate({ slug: slug as string, fields: [{ status }] });
  };

  const handleCode = (inputCode: string) => {
    if (inputCode.length > 4) return;
    setCode(inputCode.toUpperCase().trim());
  };

  const isToBeInvited = guest?.data?.status === GuestStatus.to_be_invited;

  if (!isToBeInvited && guest?.data && !updateGuestMutation.isPending) {
    const redirectTo = checkNextStep({ slug: slug as string, status: guest.data?.status as GuestStatus });
    if (redirectTo) redirect(redirectTo);
    return <InviteSkeleton />;
  }

  if (!isLoading && !updateGuestMutation?.isPending && guest?.data) {
    return (
      guest?.data && (
        <>
          <div className="mb-4">
            <h1 className="font-heading text-4xl"> Olá, {guest.data.name}!</h1>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-justify">
              É com imensa alegria e emoção que te convido a celebrar minha formatura em Medicina! Após anos de dedicação e superação, alcancei mais um sonho e chegou a hora de comemorar!
            </p>
            <p className="text-justify">
              Sempre vi a medicina como um chamado: cuidar do paciente com amor, dedicação e empatia, sem distinção; aliviar o sofrimento e trazer paz – mental, física e, por vezes, espiritual; lutar pela excelência técnica e pessoal, valorizando cada pessoa como um familiar ou amigo próximo. Tenho o privilégio de unir dois sonhos: ser médico e programador. Combinação única que me permite não apenas facilitar a vida profissional médica, eliminando tarefas corriqueiras e aumentando meu tempo para o cuidado, mas também inovar, expandir possibilidades e impactar positivamente milhares de vidas.
            </p>
            <p className="text-justify">
              A festa será no dia <span className="font-bold">31 de janeiro de 2025</span>, na <span className="font-bold">Domus Hall</span>. Sua presença nesta celebração será um privilégio e tornará este momento ainda mais especial! Te aguardo lá!
            </p>
            <p className="text-right">
              <span className="font-heading font-bold">Danillo Estrela</span>
            </p>
            {isToBeInvited && (
              <div className="flex flex-col gap-4 items-center">
                <h2 className="font-heading text-2xl">Posso confirmar sua presença?</h2>
                <div className="flex gap-4 justify-center items-center">
                  <ConfirmationDialog
                    title="Atenção:"
                    description={
                      <>
                        Você clicou para <span className="font-bold">confirmar presença</span>, para continuar a ação, digite o código do convite:
                        <br />
                        <br />
                        <span className="font-bold">Código:</span>
                        <Input type="text" placeholder="XXXX" value={code} onChange={(e) => handleCode(e.target.value)} />
                      </>
                    }
                    confirmLabel="Confirmar"
                    onConfirm={() => handlePresenceAction(true)}
                    onCancel={() => setCode('')}
                  >
                    <Button className="hover:bg-gray-600">Pode confirmar!</Button>
                  </ConfirmationDialog>
                  <ConfirmationDialog
                    title="Atenção:"
                    description={
                      <>
                        Você <span className="font-bold">não poderá comparecer</span>, para continuar a ação, digite o código do convite:
                        <br />
                        <br />
                        <span className="font-bold">Código:</span>
                        <Input type="text" placeholder="XXXX" value={code} onChange={(e) => handleCode(e.target.value)} />
                      </>
                    }
                    confirmLabel="Confirmar"
                    onConfirm={() => handlePresenceAction()}
                    onCancel={() => setCode('')}
                  >
                    <Button variant="outline" className="bg-transparent hover:bg-gray-200 border-black">Não posso ir</Button>
                  </ConfirmationDialog>
                </div>
              </div>
            )}
          </div>
        </>
      )
    );
  }

  return <InviteSkeleton />;
}
