'use client';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Location } from '@/components/Location';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { fetchGuest } from '@/lib/api/getters';
import { updateGuestField } from '@/lib/api/mutations';
import { GuestStatusEnum, MergedGuest } from '@/lib/GoogleSheetsService';
import { checkNextStep } from '@/lib/StepService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

interface Data {
  data: MergedGuest | null;
}

const guestEnum: Partial<Record<GuestStatusEnum, GuestStatusEnum>> = {
  attending: 'attending',
  attending_name_check_pending: 'attending_name_check_pending',
};

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.slug;
  const skeletonStyles = "bg-gray-300";

  const { data: guest, isLoading, error } = useQuery<Data>({
    queryKey: ['guest', slug],
    queryFn: () => fetchGuest(slug as string),
    initialData: { data: null } as Data,
  });

  const mutation = useMutation({
    mutationFn: (newName: string) => updateGuestField({ slug: slug as string, fields: [{ name: newName }, { status: guestEnum.attending }]}),
    onSuccess: (updatedField) => {
      toast({
        title: 'Sucesso!',
        description: 'Nome confirmado com sucesso!',
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
      const redirectTo = checkNextStep({slug: slug as string, status: updatedField.status as GuestStatusEnum});
      if(redirectTo) router.push(redirectTo);
    },
    onError: () => {
      toast({
        title: 'Erro ao confirmar o nome',
        description: 'Por favor, tente novamente.',
      });
    },
  });

  const isAttendingNameCheckPending  = guest?.data?.status === guestEnum.attending_name_check_pending;

  if (!isAttendingNameCheckPending && guest?.data?.status) {
    const redirectTo = checkNextStep({ slug: slug as string, status: guest?.data?.status as GuestStatusEnum });
    if (redirectTo) router.push(redirectTo);
    return null;
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    queryClient.setQueryData(['guest', slug], (oldData: Data | undefined) => {
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
    if(!guest?.data?.name) return;
    mutation.mutate(guest.data.name);
  };



  if (isLoading || mutation.isPending || !guest?.data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className={`w-96 h-10 ${skeletonStyles}`} />
        <Skeleton className={`w-80 h-10 ${skeletonStyles}`} />
        <Skeleton className={`w-full h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-24 h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-60 h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-96 h-6 ${skeletonStyles}`} />
        <Skeleton className={`w-full h-12 ${skeletonStyles}`} />
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
              description={<>O nome a confirmar é: <span className="font-bold">{guest.data?.name}</span></>}
              confirmLabel="Tudo certo, pode confirmar!"
              onConfirm={handleConfirmation}
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
