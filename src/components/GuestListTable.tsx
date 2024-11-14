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
import { Guest } from "@/lib/GoogleSheetsService";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";


export function GuestListTable({ guests }: { guests: Guest[] }) {
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopyLink = (link: string, id: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLinkId(id);
      toast({
        title: "Link copiado com sucesso!",
        description: "Link copiado com sucesso!",
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
          <TableHead className="text-right">Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {guests.map((guest) => (
          <TableRow key={guest.id}>
            <TableCell className="font-medium">{guest.id}</TableCell>
            <TableCell>{guest.name}</TableCell>
            <TableCell>{guest.whatsapp}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end items-center gap-2">
                <span className="text-sm">{guest.link}</span>
                <Button onClick={() => handleCopyLink(guest?.link || '', guest.id)}>
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