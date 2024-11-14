'use client';
import { fetchGuests, GuestsData } from '@/lib/api/getters'; // Assume this function fetches a list of guests
import { useQuery } from '@tanstack/react-query';

export interface GuestsHookReturn {
  guests: GuestsData | null;
  isLoading: boolean;
  error: Error | null;
}

export function useGuests(authenticated: boolean): GuestsHookReturn {
  const { data: guests, isLoading, error } = useQuery<GuestsData>({
    queryKey: ['guests'],
    queryFn: fetchGuests,
    initialData: { data: null } as GuestsData,
    enabled: authenticated,
  });

  return { guests, isLoading, error };
}
