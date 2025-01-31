import { GuestStatus } from "@/constants/general";
import { GuestsData, GuestsSingleData, UpdateGuestFieldProps } from "@/types/GuestTypes";


export const guests = {
    list: async ({ page = 1, pageSize = 20, status = GuestStatus.all }: { page?: number, pageSize?: number, status?: GuestStatus }): Promise<GuestsData> => {
        return fetch(`/api/guests?page=${page}&pageSize=${pageSize}&status=${status}`).then((res) => res.json());
    },
    single: async (slug: string): Promise<GuestsSingleData> => {
        return fetch(`/api/guests/${slug}`).then((res) => res.json());
    },
    update: async ({ slug, fields }: UpdateGuestFieldProps): Promise<GuestsSingleData> => {
        const fetchResponse = await fetch(`/api/guests/${slug}`, {
            method: 'POST',
            body: JSON.stringify(fields),
        })
        if(!fetchResponse.ok) {
            const errorResponse = await fetchResponse.json();
            throw new Error(errorResponse.message as string);
        }
        return fetchResponse.json();
    },
    validateCode: async ({guestId, code}: {guestId: string, code: string}): Promise<{data: boolean}> => {
        const fetchResponse = await fetch(`/api/guests/${guestId}/code`, {
          method: 'POST',
          body: JSON.stringify({ code }),
        });
        return fetchResponse.json();
    }
}