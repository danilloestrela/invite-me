'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { GuestStatus } from "@/constants/general";
import { useToast } from "@/hooks/use-toast";
import { MergedGuest } from "@/types/GuestTypes";
import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";


export function GuestListTable({ guests }: { guests: MergedGuest[] }) {
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const { toast } = useToast();

  const confirmLinksText = (can_confirm: Omit<MergedGuest, 'can_confirm'>[]) => {
    let canConfirm = can_confirm
    if (typeof can_confirm === 'string') {
      canConfirm = [can_confirm]
    }
    const confirmLinks = canConfirm.map(person => `- ${person.name}: \n  -- Código do convite: ${person.code} \n  -- Link: ${person.link}`).join('\n');
    if (confirmLinks.length === 0) return '';
    return `Você também pode confirmar ou rejeitar a presença das pessoas da lista. Não precisa ir de link em link, apenas faça sua confirmação pelo seu link, ao final uma lista aparecerá para que possa fazer rapidamente esse procedimento.
  Abaixo a lista de convidados que você pode confirmar:
  ${confirmLinks}`
  }

  const handleCopyLink = ({ link, code, id, can_confirm }: { link: string, code: string, id: string, can_confirm: Omit<MergedGuest, 'can_confirm'>[] | [] }) => {
    if (!link) return;


    const text = `🎓✨ Convite de Formatura ✨🎓

Oi! Aqui é Danillo e estou muito feliz em te convidar para minha festa de formatura em medicina! Vamos comemorar juntos esse momento especial!

📅 Data: 31 de janeiro de 2025
🕙 Hora: 22h
📍 Local: Domus Hall
- Dress Code:
Homens: terno ou camisa social com blazer
Mulheres: vestido, saia ou conjunto social (não necessariamente longo, mas elegante)
- Atenção mulheres: não usar vestido na cor verde (cor das formandas)
- Atenção homens: não usar smoking, gravata verde, gravata borboleta. Preferir cores que não sejam verdes. (cor dos formandos em medicina)
----
Seu código de convite é: ${code}
Confirme sua presença pelo link: ${link}
----
`+ confirmLinksText(can_confirm) +`

Por favor note que, devido à grande quantidade de convidados, é possível que não haja cadeiras para todos. Vamos priorizar os mais velhos. Apesar disso, estou tentando uma alternativa para as cadeiras.

Aguardo sua confirmação ${can_confirm.length > 0 ? 'e dos que puder confirmar!' : '!'}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedLinkId(id);
      toast({
        title: "Sucesso!",
        description: "Link com texto copiado com sucesso!",
      });
      setTimeout(() => setCopiedLinkId(null), 3000);
    });
  };

  if (!guests) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">id</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Whatsapp</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Código</TableHead>
          <TableHead className="text-right">Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {guests.map((guest) => (
          <TableRow key={guest.id}>
            <TableCell className="font-medium">{guest.id}</TableCell>
            <TableCell>{guest.name}</TableCell>
            <TableCell>{guest.whatsapp}</TableCell>
            <TableCell><StatusCell status={guest.status} /></TableCell>
            <TableCell>{guest.code ?? ''}</TableCell>
            <TableCell className="text-right">
              {guest.link && (
                <div className="flex justify-end items-center gap-2">
                  <Link href={guest.link} className="text-sm" target="_blank">{guest.link}</Link>
                  <Button onClick={() => handleCopyLink({
                    link: guest?.link || '',
                    code: guest.code ?? '',
                    id: guest.id,
                    can_confirm: guest.can_confirm as Omit<MergedGuest, 'can_confirm'>[] || []
                  })}>
                    {copiedLinkId !== guest.id && <Copy className="w-4 h-4" />}
                    {copiedLinkId === guest.id && <Check className="w-4 h-4 text-green-500" />}
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const StatusCell = ({ status }: { status: GuestStatus }) => {
  if (status === GuestStatus.attending) return <span className="text-green-500 bg-green-100 rounded-md px-2 py-1">Irá a festa! 😄</span>
  if (status === GuestStatus.not_attending) return <span className="text-red-500 bg-red-100 rounded-md px-2 py-1">Não irá comparecer 😔</span>
  return <span className="text-yellow-500 bg-yellow-100 rounded-md px-2 py-1">Ainda não confirmou! 🤔 ({status})</span>
}