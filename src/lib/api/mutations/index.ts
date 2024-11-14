import { MergedGuest } from "@/lib/GoogleSheetsService";

export interface UpdateGuestFieldProps {
    slug: string;
    fields: Partial<{ [key in keyof MergedGuest]: string | number | Date }>[];
}

export interface GuestData {
  data: MergedGuest | null;
}

export const updateGuestField = async ({ slug, fields }: UpdateGuestFieldProps): Promise<GuestData> => {
  const fetchResponse = await fetch(`/api/guests/${slug}`, {
      method: 'POST',
      body: JSON.stringify(fields),
    })
    if(!fetchResponse.ok) {
      const errorResponse = await fetchResponse.json();
      throw new Error(errorResponse.message as string);
    }
    return fetchResponse.json();
  }

export const authenticate = async ({username, password}: {username: string, password: string}): Promise<{message: string}> => {
  const fetchResponse = await fetch('/api/users/auth', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if(!fetchResponse.ok) {
    const errorResponse = await fetchResponse.json();
    throw new Error(errorResponse.message as string);
  }
  return fetchResponse.json();
}