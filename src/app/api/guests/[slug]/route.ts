import { getGuestById, updateGuestField } from '@/lib/GoogleSheetsService';
import { decodeBase64WithSalt } from "@/lib/utils";

export async function GET( request: Request,
    { params }: { params: Promise<{ slug: string }> } ) {
  const id = (await params)?.slug ?? params;
  const decodedId = decodeBase64WithSalt(id as string);
  try {
    const data = await getGuestById(decodedId);
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Error fetching data', message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const id = (await params)?.slug ?? null;
  if(!id) return Response.json({ error: 'No id provided' }, { status: 400 });

  const res = await request.json();
  const decodedId = decodeBase64WithSalt(id);
  const updatedGuest: unknown = await updateGuestField({ id: decodedId, fields: res });
  if(!updatedGuest) return Response.json({ error: 'Failed to update guest' }, { status: 404 });

  return Response.json({ data: updatedGuest }, { status: 200 });
}