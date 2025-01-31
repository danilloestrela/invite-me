import { GuestStatus } from "@/constants/general";
import { google, sheets_v4 } from "googleapis";

export interface Guest {
    id: string;
    name: string;
    description?: string;
    whatsapp?: string;
    can_confirm?: string[] | string | Omit<MergedGuest, 'can_confirm' | 'code'>[];
    relation?: string;
    link?: string;
  }


export interface GuestState {
    guest_id: string;
    seat?: string;
    code?: string;
    message: string;
    status: GuestStatus;
    acknowledged: string;
    updated_at: string;
    created_at: string;
  }

export interface GuestsData {
    data: MergedGuest[] | null;
    page: number;
    totalPages: number;
}

export interface GetTableBasedOnRangeReturn {
  res: sheets_v4.Schema$ValueRange;
  sheets: ReturnType<typeof google.sheets>;
  headers: string[];
  rows: string[][];
}

export interface GuestsSingleData {
    data: MergedGuest | null;
}

export interface UpdateGuestFieldProps {
    slug: string;
    fields: Partial<{ [key in keyof MergedGuest]: string | number | Date } & { from_id?: string }>[];
}

export interface MergedGuest extends Guest, Omit<GuestState, 'guest_id'> { }

export interface FullGuestsPaginatedResponse {
    guests: MergedGuest[];
    page: number;
    totalPages: number;
  }

export interface UpdateGuestApiProps {
    id: string;
    fields: { [key in keyof MergedGuest]: string }[];
}