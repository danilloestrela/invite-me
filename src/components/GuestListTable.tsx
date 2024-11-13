import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Guest } from "@/lib/GoogleSheetsService";


export function GuestListTable({ guests }: { guests: Guest[] }) {

    if(!guests) return null;

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
              <TableCell className="text-right">{guest.link}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }