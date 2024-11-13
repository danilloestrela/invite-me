import { MergedGuest } from "@/lib/GoogleSheetsService";

export interface UpdateGuestFieldProps {
    slug: string;
    fields: Partial<{ [key in keyof MergedGuest]: string | number | Date }>[];
}

export const updateGuestField = async ({ slug, fields }: UpdateGuestFieldProps): Promise<MergedGuest | null> => {
  const fetchResponse = await fetch(`/api/guests/${slug}`, {
      method: 'POST',
      body: JSON.stringify(fields),
    })
    if(!fetchResponse.ok) {
      throw new Error(fetchResponse.statusText);
    }
    return fetchResponse.json();
  }