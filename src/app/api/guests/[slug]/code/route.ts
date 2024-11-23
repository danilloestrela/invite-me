import { validateCodeFromGuestId } from "@/lib/GoogleSheetsService";
import { decodeBase64WithSalt } from "@/lib/utils";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const id = (await params)?.slug ?? null;
    if(!id) return Response.json({ error: 'No id provided' }, { status: 400 });

    const res = await request.json();
    const decodedId = decodeBase64WithSalt(id);
    const isCodeValid: boolean = await validateCodeFromGuestId(decodedId, res.code);
    if(!isCodeValid) return Response.json({ error: 'Invalid code' }, { status: 400 });

    return Response.json({ data: isCodeValid }, { status: 200 });
  }