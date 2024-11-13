'use client';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { InviteSkeleton } from '@/components/modules/invite/Skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useGuest } from '@/hooks/useGuest';
import { GuestStatusEnum } from '@/lib/GoogleSheetsService';
import { checkNextStep } from '@/lib/StepService';
import { useParams, useRouter } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = params.slug;
  const { guest, isLoading, error, updateGuestMutation, guestEnum } = useGuest(slug as string);

  const handlePresenceAction = (action: boolean = false) => {
    const status = action ? guestEnum.attending_name_check_pending : guestEnum.not_attending_message_pending;
    updateGuestMutation.mutate({ slug: slug as string, fields: [{ status }] });
  };

  const isToBeInvited = guest?.data?.status === guestEnum.to_be_invited;

  if (!isToBeInvited && guest?.data) {
    const redirectTo = checkNextStep({ slug: slug as string, status: guest.data?.status as GuestStatusEnum });
    if (redirectTo) router.push(redirectTo);
    return <InviteSkeleton />;
  }

  if (error) {
    toast({
      title: 'Erro ao carregar os dados do convidado',
      description: 'Por favor, tente novamente atualizando a página ou entre em contato com Danillo Estrela.',
    });
    return <>
      <div className="mb-4">
        <h1 className="font-heading text-4xl"> Algo deu errado... Recarregue a página.</h1>
      </div>
    </>
  }

  if (!isLoading && !updateGuestMutation?.isPending && guest?.data) {
    return (guest?.data &&
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
                title='Atenção:'
                description={
                  <>
                    Você clicou para <span className="font-bold">confirmar presença</span>, deseja continuar essa ação?
                  </>
                }
                confirmLabel="Sim"
                onConfirm={() => handlePresenceAction(true)}
              >
                <Button className="hover:bg-gray-600">Pode confirmar!</Button>
              </ConfirmationDialog>
              <ConfirmationDialog
                title='Atenção:'
                description={
                  <>
                    Você <span className="font-bold">não poderá comparecer</span>, informe o código para continuar sua ação.
                    <br />
                    <span className="font-bold">Código:</span>
                    <Input type="text" value={guest.data.id} />
                  </>
                }
                confirmLabel="Sim"
                onConfirm={() => handlePresenceAction()}
              >
                <Button variant="outline" className="bg-transparent hover:bg-gray-200 border-black">Não posso ir</Button>
              </ConfirmationDialog>
            </div>
            </div>
          )}
        </div>
      </>
  );
  }

  return <InviteSkeleton />;
}
