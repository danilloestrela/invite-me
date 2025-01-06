import { getTableInfo } from '@/helpers/googleapi/googleSheet';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { google, sheets_v4 } from 'googleapis';
import { encodeBase64WithSalt, validatesForDatabaseRequiredFormat } from './utils';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];
const timezone = 'America/Recife';
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

/**
 * Merged guests are the states + guest list
 */
export interface MergedGuest extends Guest, Omit<GuestState, 'guest_id'> { }
export async function getMergedPublicGuests(): Promise<MergedGuest[]> {
  const { guests, guestStateMap } = await getMergedGuests();

  const mergedGuests = guests.map(guest => {
    const theGuest = { ...guest };
    const guestState = guestStateMap.get(theGuest.id); // Get matching state data by guest `id`
    const toMergeGuestState = { ...guestState, id: theGuest.id }
    delete toMergeGuestState.code;
    delete toMergeGuestState.guest_id;
    delete toMergeGuestState.message;
    delete toMergeGuestState.seat;
    delete theGuest.relation;
    delete theGuest.whatsapp;
    delete theGuest.description;
    delete theGuest.link;
    return {
      ...theGuest,
      ...toMergeGuestState,
    };
  });

  return mergedGuests as MergedGuest[];
}

export async function getMergedGuests(): Promise<{ guests: Guest[], guestStateMap: Map<string, GuestState>}> {
  const guests = await getGuestsList(); // data from Lista Oficial
  const guestStates = await getGuestStates(); // data from guest_states, now an array of objects

  const guestStateMap = new Map(guestStates.map(state => [state.guest_id, state])); // Map by `id` for quick lookup
  return { guests, guestStateMap };
}

/**
 * This method returns public validated guest info for the users
 */
export async function getGuests(): Promise<MergedGuest[]> {
  const mergedGuests = await getMergedPublicGuests();
  const mergedGuestIncludingCanConfirm = await getCanConfirmGuests({ guests: mergedGuests });

  return mergedGuestIncludingCanConfirm;
}

/**
 * This function returns the merged guests with the can_confirm field and states
 */
export async function getFullGuests(): Promise<MergedGuest[]> {
  const { guests, guestStateMap } = await getMergedGuests();
  const mergedGuests = guests.map(guest => {
    const guestState = guestStateMap.get(guest.id); // Get matching state data by guest `id`
    const toMergeGuestState = { ...guestState, id: guest.id }
    return {
      ...guest,
      ...toMergeGuestState,
    };
  }) as MergedGuest[];

  const mergedGuestIncludingCanConfirm = await getCanConfirmGuests({ guests: mergedGuests });

  return mergedGuestIncludingCanConfirm as MergedGuest[];
}

export async function getFullGuestsPaginated({ page, pageSize }: { page: number, pageSize: number }): Promise<MergedGuest[]> {
  const guests = await getFullGuests();
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return guests.slice(startIndex, endIndex);
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
  const zonedDate = toZonedTime(new Date(), timezone);
  const formattedDate = format(zonedDate, 'dd/MM/yyyy HH:mm:ss');

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

export async function getCanConfirmGuests({ guests }: { guests: MergedGuest[] }): Promise<MergedGuest[]> {
  if (!guests) return [];
  const guestsCanConfirm = await Promise.all(
    guests.map(async (guest) => {
      const updatedGuest = await getGuestCanConfirmObject(guest, guests);
      return updatedGuest;
    })
  );
  return guestsCanConfirm;
}

async function getGuestCanConfirmObject(guest: MergedGuest, guests: MergedGuest[]): Promise<MergedGuest> {
  const guestWithConfirm = { ...guest };
  if (typeof guestWithConfirm.can_confirm === 'string') {
    guestWithConfirm.can_confirm = guestWithConfirm.can_confirm.split(',');
  }
  if (!guestWithConfirm.can_confirm || guestWithConfirm.can_confirm.length === 0) {
    return guestWithConfirm;
  }
  const guestsFound = guestWithConfirm.can_confirm.map((id) => guests.find((theGuest) => {
    const thisGuest = { ...theGuest };
    if (thisGuest.id.trim() === (id as string).trim()) {
      return thisGuest;
    }
    return undefined
  }));

  const filterredGuests = guestsFound.filter((theGuest) => theGuest !== undefined);
  const guestWithoutSomeThings = filterredGuests.map((theGuest) => {
    if (theGuest) {
      delete theGuest.can_confirm;
      return theGuest;
    }
  }).filter((theGuest) => theGuest !== undefined);

  guestWithConfirm.can_confirm = guestWithoutSomeThings ?? [];
  return guestWithConfirm;
}


export async function appendToLog({ rows }: { rows: { [key: string]: string } }) {
  const zonedDate = toZonedTime(new Date(), timezone);
  const formattedDate = format(zonedDate, 'dd/MM/yyyy HH:mm:ss');
  const sheets = await initGoogleSheetWithGoogleApis();
  const logSheetName = process.env.GOOGLE_SHEET_GUEST_LOG as string;
  const theRows = {
    ...rows,
    created_at: formattedDate ,
    updated_at: formattedDate,
  }
  console.log(`Logging: ${JSON.stringify(theRows)}`)
  // Transform rows into an array of arrays (as required by the Google Sheets API)
  const formattedRows = Object.values(theRows);

  // Append rows to the sheet dynamically
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID as string,
    range: logSheetName, // Dynamic range (sheet name only)
    valueInputOption: 'RAW', // Insert values as-is
    insertDataOption: 'INSERT_ROWS', // Always add rows at the end
    requestBody: {
      values: [formattedRows], // Wrap in an array to make it a 2D array
    },
  });
  if (response.status !== 200) {
    throw new Error('Failed to append rows to log');
  }

  return response.data;
}

export async function validateCodeFromGuestId(guestId: string, code: string) {
  const guestStates = await getGuestStates();
  const guestState = guestStates.find((state) => state.guest_id === guestId);
  if (!guestState) throw new Error('Guest state not found');
  return guestState.code === code;
}
