'use client';
import { GuestsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export interface GuestsHookReturn {
  guests: GuestsApi.GuestsData | null;
  isLoading: boolean;
  error: Error | null;
}

export function useGuests(authenticated: boolean): GuestsHookReturn {
  const { data: guests, isLoading, error } = useQuery<GuestsApi.GuestsData>({
    queryKey: ['guests'],
    queryFn: GuestsApi.guests.list,
    initialData: { data: null } as GuestsApi.GuestsData,
    enabled: authenticated,
  });

  return { guests, isLoading, error };
}
