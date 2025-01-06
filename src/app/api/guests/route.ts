import { getFullGuestsPaginated, MergedGuest } from '@/lib/GoogleSheetsService';

export interface ResponseGuests {
  data: MergedGuest[];
  total: number;
  page: number;
  totalPages: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 1;
    const pageSize = searchParams.get('pageSize') || 20;

    console.log(page, pageSize);

    const data = await getFullGuestsPaginated({ page: Number(page), pageSize: Number(pageSize) });
    return Response.json({
      data: data.guests,
      total: data.guests.length,
      page: Number(page),
      totalPages: data.totalPages,
    } as ResponseGuests, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Error fetching data', message: (error as Error).message }, { status: 500 });
  }
}