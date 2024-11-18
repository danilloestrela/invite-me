import { appendToLog } from "@/lib/GoogleSheetsService";
import { decodeBase64WithSalt } from "@/lib/utils";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const id = (await params)?.slug ?? null;
    if(!id) return Response.json({ error: 'No id provided' }, { status: 400 });

    const res = await request.json();
    const decodedId = decodeBase64WithSalt(id);
    const rows = { id: decodedId, ...res };
    const updatedGuest: unknown = await appendToLog(rows);
    if(!updatedGuest) return Response.json({ error: 'Failed to update guest' }, { status: 404 });

    return Response.json({ data: updatedGuest }, { status: 200 });
  }