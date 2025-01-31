'use client';
import { GuestStatus } from '@/constants/general';
import { GuestsApi } from '@/lib/api';
import { GuestsData } from '@/types/GuestTypes';
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';

export interface GuestsHookReturn {
  guests: GuestsData | null;
  isLoading: boolean;
  error: Error | null;
  gotoPageMutation: UseMutationResult<GuestsData, Error, number, unknown>;
}

export interface GuestsHookProps {
  authenticated: boolean;
  status?: GuestStatus;
  page?: number;
  pageSize?: number;
}

export function useGuests({authenticated, status = GuestStatus.all, page = 1, pageSize = 20}: GuestsHookProps): GuestsHookReturn {
  const queryClient = useQueryClient();
    const { data: guests, isLoading, error } = useQuery<GuestsData>({
      queryKey: ['guests'],
    queryFn: () => GuestsApi.guests.list({ page, pageSize, status: status }),
    initialData: { data: null } as GuestsData,
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
