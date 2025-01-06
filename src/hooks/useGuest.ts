'use client';
import { GuestsApi } from '@/lib/api';
import { GuestStatusEnum } from '@/lib/GoogleSheetsService';
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export interface GuestHookReturn {
  guest: GuestsApi.GuestsSingleData;
  isLoading: boolean;
  error: Error | null;
  guestEnum: Partial<Record<GuestStatusEnum, GuestStatusEnum>>;
  updateGuestMutation: UseMutationResult<GuestsApi.GuestsSingleData | null, Error, GuestsApi.UpdateGuestFieldProps, unknown>;
  validateCodeMutation: UseMutationResult<{data: boolean}, Error, {guestId: string, code: string}, unknown>;
}
export const guestEnum: Partial<Record<GuestStatusEnum, GuestStatusEnum>> = {
  to_be_invited: 'to_be_invited',
  attending: 'attending',
  attending_name_check_pending: 'attending_name_check_pending',
  not_attending_message_pending: 'not_attending_message_pending',
  not_attending: 'not_attending',
  acknowledged: 'acknowledged',
  awaiting_accept: 'awaiting_accept',
};

export function useGuest(slug: string, enabled: boolean = true): GuestHookReturn {

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: guest, isLoading, error } = useQuery<GuestsApi.GuestsSingleData>({
    queryKey: ['guest', slug],
    queryFn: () => GuestsApi.guests.single(slug),
    initialData: { data: null } as GuestsApi.GuestsSingleData,
    enabled,
  });

  const updateGuestMutation = useMutation<GuestsApi.GuestsSingleData | null, Error, GuestsApi.UpdateGuestFieldProps>({
    mutationFn: (data: GuestsApi.UpdateGuestFieldProps) => GuestsApi.guests.update(data),
    onSuccess: (updatedData) => {
      toast({
        title: 'Sucesso!',
        description: 'Convidado atualizado com sucesso!',
      });
      queryClient.setQueryData(['guest', slug], (oldData: GuestsApi.GuestsSingleData | undefined) => {
        if (!updatedData?.data) return oldData;
        const newData = {
          data: {
            ...oldData?.data,
            ...updatedData.data,
          },
        };
        return newData;
      }, );
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar o convidado',
        description: 'Por favor, tente novamente ou entre em contato com Danillo Estrela.',
      });
    }
  });

  const validateCodeMutation = useMutation<{data: boolean}, Error, {guestId: string, code: string}>({
    mutationFn: ({guestId, code}) => GuestsApi.guests.validateCode({guestId, code}),
  });

  return { guest, isLoading, error, updateGuestMutation, validateCodeMutation, guestEnum };
}
