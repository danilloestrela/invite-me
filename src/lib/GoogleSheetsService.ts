import { getTableInfo } from '@/helpers/googleapi/googleSheet';
import { format } from 'date-fns';
import { google, sheets_v4 } from 'googleapis';
import { encodeBase64WithSalt, validatesForDatabaseRequiredFormat } from './utils';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];

const doc_id = process.env.GOOGLE_SPREADSHEET_ID as string;
const guestListTableRange = process.env.GOOGLE_SHEET_GUESTS_LIST_RANGE as string;
const guestStatesTableRange = process.env.GOOGLE_SHEET_GUEST_STATES_RANGE as string;

enum GuestFields {
  id = 'id',
  name = 'name',
  description = 'description',
  whatsapp = 'whatsapp',
  can_confirm = 'can_confirm',
  relation = 'relation',
}

enum GuestStateFields {
  guest_id = 'guest_id',
  seat = 'seat',
  code = 'code',
  status = 'status',
  message = 'message',
  acknowledged = 'acknowledged',
  updated_at = 'updated_at',
  created_at = 'created_at',
}
/**
 * status explanation:
 * to_be_invited: convidado não confirmou presença
 * attending: convidado confirmou presença
 * not_attending: convidado não estará presente
 * acknowledged: link de confirmação foi enviado ao convidado
 * awaiting_accept: convidado ainda não aceitou o convite mesmo após abrir o link de confirmação ou alguém aceitou em seu lugar.
 * rejected: convidado foi retirado da lista de convidados
 */
export enum GuestStatus {
  to_be_invited = 'to_be_invited',
  attending = 'attending',
  attending_name_check_pending = 'attending_name_check_pending',
  not_attending = 'not_attending',
  not_attending_message_pending = 'not_attending_message_pending',
  acknowledged = 'acknowledged',
  awaiting_accept = 'awaiting_accept',
}

export type GuestStatusEnum = keyof typeof GuestStatus;

export interface Guest {
  id: string;
  name: string;
  description: string;
  whatsapp: string;
  can_confirm: string[];
  relation: string;
  link?: string;
}


export interface GuestState {
  guest_id: string;
  seat: string;
  code: string;
  message: string;
  status: GuestStatus;
  acknowledged: string;
  updated_at: string;
  created_at: string;
}

export async function initGoogleSheetWithGoogleApis() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });

  return sheets;
}

interface GetTableBasedOnRangeReturn {
  res: sheets_v4.Schema$ValueRange;
  sheets: ReturnType<typeof google.sheets>;
  headers: string[];
  rows: string[][];
}

async function getTableBasedOnRange(range: string): Promise<GetTableBasedOnRangeReturn> {
  const sheets = await initGoogleSheetWithGoogleApis();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: doc_id,
    range,
  }) as { data: sheets_v4.Schema$ValueRange };
  // table headers
  const headers = res.data.values?.[0];
  // table rows (without headers)
  const rows = res.data.values?.slice(1);
  if (!headers) throw new Error('No headers found');
  if (!rows) throw new Error('No guests found');

  return { res: res.data, sheets, headers, rows };
}

export async function getGuestStates(): Promise<GuestState[]> {
  const { res, rows } = await getTableBasedOnRange(guestStatesTableRange);

  if (!rows) throw new Error('No guest states found');

  const data = await getTableInfo({
    tableData: res.values as string[][],
  }) as unknown as GuestState[];

  return data;
}

export async function getGuestsList(): Promise<Guest[]> {
  const { res, rows } = await getTableBasedOnRange(guestListTableRange);
  if (!rows) throw new Error('No guests found');

  const data = await getTableInfo({
    tableData: res.values as string[][],
  }) as unknown as Guest[];

  const guestsWithLink = data.map((guest) => {
    const guestSalted = encodeBase64WithSalt(guest.id)
    return ({
      ...guest,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${guestSalted}`
    })
  });

  return guestsWithLink;
}

export interface MergedGuest extends Guest, Omit<GuestState, 'guest_id'> { }
export async function getMergedGuests(): Promise<MergedGuest[]> {
  const guests = await getGuestsList(); // data from Lista Oficial
  const guestStates = await getGuestStates(); // data from guest_states, now an array of objects

  const guestStateMap = new Map(guestStates.map(state => [state.guest_id, state])); // Map by `id` for quick lookup

  const mergedGuests = guests.map(guest => {
    const guestState = guestStateMap.get(guest.id); // Get matching state data by guest `id`
    const toMergeGuestState = { ...guestState, id: guest.id }
    return {
      ...guest,
      ...toMergeGuestState,
    };
  });

  return mergedGuests as MergedGuest[];
}


export async function getGuests(): Promise<MergedGuest[]> {
  const mergedGuests = await getMergedGuests();
  return mergedGuests;
}

export async function getGuestById(id: string): Promise<MergedGuest | undefined> {
  const guests = await getGuests();
  const guest = guests.find((guest) => guest.id === id);
  if (!guest) throw new Error('Guest not found');
  return guest;
}

interface UpdateGuestApiProps {
  id: string;
  fields: { [key in keyof MergedGuest]: string }[];
}

export async function updateGuestField({ id, fields }: UpdateGuestApiProps) {
  const validatedFormat = validatesForDatabaseRequiredFormat(fields);
  if (!validatedFormat) throw new Error('Invalid request format');

  const guestUpdates: sheets_v4.Schema$ValueRange[] = [];
  const guestStateUpdates: sheets_v4.Schema$ValueRange[] = [];
  const formattedDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

  for (const { field, value } of validatedFormat) {
    const rangeInfo = field in GuestFields ? guestListTableRange : guestStatesTableRange;
    const { cell } = await getFieldIndexAndRowIndex({ field, id, range: rangeInfo });

    // Define o range da célula e o valor para o campo correspondente
    if (field in GuestFields) {
      guestUpdates.push({
        range: `${rangeInfo.split('!')[0]}!${cell}`,
        values: [[value]],
      });
    } else if (field in GuestStateFields) {
      guestStateUpdates.push({
        range: `${rangeInfo.split('!')[0]}!${cell}`,
        values: [[value]],
      });
      if (field !== 'updated_at') {
        // Atualize o campo updated_at se for uma atualização de GuestState
        const rangeInfo = 'updated_at' in GuestFields ? guestListTableRange : guestStatesTableRange;
        const { cell: updatedAtCell } = await getFieldIndexAndRowIndex({ field: 'updated_at', id, range: rangeInfo });
        guestStateUpdates.push({
          range: `${rangeInfo.split('!')[0]}!${updatedAtCell}`,
          values: [[formattedDate]],
        });
      }
    } else {
      throw new Error('Field not found');
    }
  }

  const sheets = await initGoogleSheetWithGoogleApis();

  // Executa a atualização em batch para Lista Oficial, se houver updates
  if (guestUpdates.length > 0) {
    const guestRes = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: doc_id,
      requestBody: {
        valueInputOption: 'RAW',
        data: guestUpdates,
      },
    });
    if (guestRes.status !== 200) {
      throw new Error('Batch update for guest list failed.');
    }
  }

  // Executa a atualização em batch para guest_states, se houver updates
  if (guestStateUpdates.length > 0) {
    const guestStateRes = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: doc_id,
      requestBody: {
        valueInputOption: 'RAW',
        data: guestStateUpdates,
      },
    });
    if (guestStateRes.status !== 200) {
      throw new Error('Batch update for guest states failed.');
    }
  }
  const updatedGuest = await getGuestById(id);
  if (!updatedGuest) throw new Error('Updated guest, but could not return updated guests');

  // Update the updatedGuest with the new field values
  for (const { field, value } of validatedFormat) {
    const updatedGuestKeys = Object.keys(updatedGuest) as (keyof MergedGuest)[];
    if (field in updatedGuestKeys) {
      // @ts-expect-error: Expect TypeScript error for dynamic field assignment
      updatedGuest[field] = value;
    }
  }
  if (guestStateUpdates.length > 0) updatedGuest.updated_at = formattedDate;

  // if success, return the updated fields
  return updatedGuest;
}


async function getFieldIndexAndRowIndex({ field, id, range }: { field: string, id: string, range: string }) {
  const { sheets, headers, rows } = await getTableBasedOnRange(range);
  // Encontrar o índice da coluna e da linha
  const fieldIndex = headers.indexOf(field);
  const rowIndex = rows.findIndex(row => row[0] === id) + 1; // +1 para compensar o cabeçalho

  if (fieldIndex === -1 || rowIndex === -1) throw new Error(`Field ${field} or guest ID ${id} not found`);

  // Calcular a célula a ser atualizada
  const cell = `${String.fromCharCode(65 + fieldIndex)}${rowIndex + 1}`;

  return { rowIndex, fieldIndex, cell, sheets };
}