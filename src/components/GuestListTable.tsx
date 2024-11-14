'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MergedGuest } from "@/lib/GoogleSheetsService";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";


export function GuestListTable({ guests }: { guests: MergedGuest[] }) {
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopyLink = ({ link, code, id }: { link: string, code: string, id: string }) => {
    if (!link) return;
    const text = `🎓✨ Convite de Formatura ✨🎓

Oi! Aqui é o Danillo e estou muito feliz em te convidar para minha festa de formatura em medicina! Vamos comemorar juntos esse momento especial!

📅 Data: 31 de janeiro de 2025
🕙 Hora: 22h
📍 Local: Domus Hall
Seu código de convite é: ${code}
Confirme sua presença pelo link: ${link}`;
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
            <TableCell>{guest.code}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end items-center gap-2">
                <span className="text-sm">{guest.link}</span>
                <Button onClick={() => handleCopyLink({ link: guest?.link || '', code: guest.code, id: guest.id })}>
                  {copiedLinkId !== guest.id && <Copy className="w-4 h-4" />}
                  {copiedLinkId === guest.id && <Check className="w-4 h-4 text-green-500" />}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}