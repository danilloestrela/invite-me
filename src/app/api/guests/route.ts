import { getFullGuests, MergedGuest } from '@/lib/GoogleSheetsService';

export interface ResponseGuests {
  data: Omit<MergedGuest, 'code'>[];
  total: number;
}

export async function GET() {
  try {
    const data = await getFullGuests();
    return Response.json({
      data,
      total: data.length,
    } as ResponseGuests, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Error fetching data', message: (error as Error).message }, { status: 500 });
  }
}