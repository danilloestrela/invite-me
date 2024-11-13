import { fetchGuest } from '@/lib/api/getters';
import { updateGuestField, UpdateGuestFieldProps } from '@/lib/api/mutations';
import { GuestStatusEnum, MergedGuest } from '@/lib/GoogleSheetsService';
import { checkNextStep } from '@/lib/StepService';
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

export interface Data {
  data: MergedGuest | null;
}

export interface GuestHookReturn {
  guest: Data;
  isLoading: boolean;
  error: Error | null;
  guestEnum: Partial<Record<GuestStatusEnum, GuestStatusEnum>>;
  updateGuestMutation: UseMutationResult<MergedGuest | null, Error, UpdateGuestFieldProps, unknown>;
}

export function useGuest(slug: string): GuestHookReturn {
  const guestEnum: Partial<Record<GuestStatusEnum, GuestStatusEnum>> = {
    attending_name_check_pending: 'attending_name_check_pending',
    not_attending_message_pending: 'not_attending_message_pending',
    to_be_invited: 'to_be_invited',
  };
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const { data: guest, isLoading, error } = useQuery<Data>({
    queryKey: ['guest', slug],
    queryFn: () => fetchGuest(slug),
    initialData: { data: null } as Data,
  });

  const updateGuestMutation = useMutation<MergedGuest | null, Error, UpdateGuestFieldProps>({
    mutationFn: (data: UpdateGuestFieldProps) => updateGuestField(data),
    onSuccess: (updatedField) => {
      toast({
        title: 'Sucesso!',
        description: 'Convidado atualizado com sucesso!',
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
      if (!updatedField?.status) return;
      const redirectTo = checkNextStep({ slug, status: updatedField?.status as GuestStatusEnum });
      if (redirectTo) router.push(redirectTo);
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar o convidado',
        description: 'Por favor, tente novamente ou entre em contato com Danillo Estrela.',
      });
    }
  });

  return { guest, isLoading, error, updateGuestMutation, guestEnum };
}
