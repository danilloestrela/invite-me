import { appendToLog, getGuestById, updateGuestField } from '@/lib/GoogleSheetsService';
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
  let updatedGuest;
  const hasFromId = res.some((field: { [key: string]: string }) => field.from_id);
  if (hasFromId) {
    const updateRes = res.filter((field: { [key: string]: string }) => !field.from_id);
    updatedGuest = await updateGuestField({ id: decodedId, fields: updateRes });
  } else {
    console.log({res})
    updatedGuest = await updateGuestField({ id: decodedId, fields: res });
  }

 if (!updatedGuest) return Response.json({ error: 'Failed to update guest' }, { status: 404 });

  try {
    if(hasFromId) {
      const resStatus = res.filter((field: { [key: string]: string }) => field.status);
      const resFromId = res.filter((field: { [key: string]: string }) => field.from_id);
      if(resStatus.length > 0 && resFromId.length > 0) {
        const rowObject = { id: resFromId[0].from_id, guest_id: decodedId, status: resStatus[0].status }
        await appendToLog({ rows: rowObject });
      }
    } else {
      const resStatus = res.filter((field: { [key: string]: string }) => field.status);
      if(resStatus.length > 0) {
        const rowObject = { id: decodedId, guest_id: decodedId, status: resStatus[0].status }
        await appendToLog({ rows: rowObject });
      }
    }
  } catch (error) {
    console.error('Failed to append to log:', (error as Error).message);
  }

  return Response.json({ data: updatedGuest }, { status: 200 });
}