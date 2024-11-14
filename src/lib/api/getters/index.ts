import { MergedGuest } from "@/lib/GoogleSheetsService";

export const fetchGuest = async (slug: string) => {
  return fetch(`/api/guests/${slug}`).then((res) => res.json());
}

export interface GuestsData {
  data: MergedGuest[] | null;
}

export const fetchGuests = async (): Promise<GuestsData> => {
  return fetch('/api/guests').then((res) => res.json());
}

