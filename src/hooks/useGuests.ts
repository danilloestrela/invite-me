'use client';
import { GuestsApi } from '@/lib/api';
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';

export interface GuestsHookReturn {
  guests: GuestsApi.GuestsData | null;
  isLoading: boolean;
  error: Error | null;
  gotoPageMutation: UseMutationResult<GuestsApi.GuestsData, Error, number, unknown>;
}

export function useGuests(authenticated: boolean): GuestsHookReturn {
  const queryClient = useQueryClient();
  const { data: guests, isLoading, error } = useQuery<GuestsApi.GuestsData>({
    queryKey: ['guests'],
    queryFn: () => GuestsApi.guests.list({ page: 1, pageSize: 20 }),
    initialData: { data: null } as GuestsApi.GuestsData,
    enabled: authenticated,
  });

  const gotoPageMutation = useMutation({
    mutationFn: (page: number) => {
      return GuestsApi.guests.list({ page });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['guests'], data);
    }
  })

  return { guests, isLoading, error, gotoPageMutation };
}
