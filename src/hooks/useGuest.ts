'use client';
import { GuestsApi } from '@/lib/api';
import { GuestsSingleData, UpdateGuestFieldProps } from '@/types/GuestTypes';
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export interface GuestHookReturn {
  guest: GuestsSingleData;
  isLoading: boolean;
  error: Error | null;
  updateGuestMutation: UseMutationResult<GuestsSingleData | null, Error, UpdateGuestFieldProps, unknown>;
  validateCodeMutation: UseMutationResult<{data: boolean}, Error, {guestId: string, code: string}, unknown>;
}


export function useGuest(slug: string, enabled: boolean = true): GuestHookReturn {

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: guest, isLoading, error } = useQuery<GuestsSingleData>({
    queryKey: ['guest', slug],
    queryFn: () => GuestsApi.guests.single(slug),
    initialData: { data: null } as GuestsSingleData,
    enabled,
  });

  const updateGuestMutation = useMutation<GuestsSingleData | null, Error, UpdateGuestFieldProps>({
    mutationFn: (data: UpdateGuestFieldProps) => GuestsApi.guests.update(data),
    onSuccess: (updatedData) => {
      toast({
        title: 'Sucesso!',
        description: 'Convidado atualizado com sucesso!',
      });
      queryClient.setQueryData(['guest', slug], (oldData: GuestsSingleData | undefined) => {
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

  return { guest, isLoading, error, updateGuestMutation, validateCodeMutation };
}
