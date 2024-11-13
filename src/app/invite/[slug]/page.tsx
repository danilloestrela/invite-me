'use client';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { fetchGuest } from '@/lib/api/getters';
import { updateGuestField, UpdateGuestFieldProps } from '@/lib/api/mutations';
import { GuestStatusEnum, MergedGuest } from '@/lib/GoogleSheetsService';
import { checkNextStep } from '@/lib/StepService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

interface Data {
  data: MergedGuest | null;
}


const guestEnum: Partial<Record<GuestStatusEnum, GuestStatusEnum>> = {
  attending_name_check_pending: 'attending_name_check_pending',
  not_attending_message_pending: 'not_attending_message_pending',
  to_be_invited: 'to_be_invited',
};

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const slug = params.slug;
  const skeletonStyles = "bg-gray-300";

  const { data: guest, isLoading, error } = useQuery<Data>({
    queryKey: ['guest', slug],
    queryFn: () => fetchGuest(slug as string),
    initialData: { data: null } as Data,
  });

  const updateGuestMutation = useMutation({
    mutationFn: (data: UpdateGuestFieldProps) => updateGuestField(data as UpdateGuestFieldProps),
    onSuccess: (updatedField) => {
      toast({
        title: 'Sucesso!',
        description: 'Status do convidado atualizado com sucesso!',
      });
      queryClient.setQueryData(['guest', slug], (oldData: Data | undefined) => {
        if (!oldData?.data) return oldData;
        return {
          data: {
            ...oldData.data,
            ...updatedField,
          },
        };
      });
      const redirectTo = checkNextStep({ slug: slug as string, status: updatedField.status as GuestStatusEnum });
      if (redirectTo) router.push(redirectTo);
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar o status do convidado',
        description: 'Por favor, tente novamente ou entre em contato com Danillo Estrela.',
      });
    }
  });

  const handlePresenceAction = (action: boolean = false) => {
    let status = action ? guestEnum.attending_name_check_pending : guestEnum.not_attending_message_pending;
    updateGuestMutation.mutate({ slug: slug as string, fields: [{ status }] });
  };

  const isToBeInvited = guest?.data?.status === guestEnum.to_be_invited;

  if (!isToBeInvited) {
    const redirectTo = checkNextStep({ slug: slug as string, status: guest?.data?.status as GuestStatusEnum });
    if (redirectTo) router.push(redirectTo);
    return null;
  }

  if (isLoading || updateGuestMutation.isPending || !guest.data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className={`w-full h-10 ${skeletonStyles}`} />
        <Skeleton className={`w-full h-48 ${skeletonStyles}`} />
        <div className="flex flex-col gap-4 items-center">
          <Skeleton className={`w-96 h-8 ${skeletonStyles}`} />
          <div className="flex gap-4 justify-center items-center">
            <Skeleton className={`w-36 h-8 ${skeletonStyles}`} />
            <Skeleton className={`w-36 h-8 ${skeletonStyles}`} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: 'Erro ao carregar os dados do convidado',
      description: 'Por favor, tente novamente atualizando a página ou entre em contato com Danillo Estrela.',
    });
  }

  return (
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
                    Você <span className="font-bold">não poderá comparecer</span>, deseja continuar essa ação?
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
