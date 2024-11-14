'use client'

import { GuestListTable } from "@/components/GuestListTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuests } from "@/hooks/useGuests";
import { useState } from "react";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { guests, isLoading } = useGuests(authenticated);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmation = () => {
    setAuthenticated(true);
  };

  if (!isLoading) {
    return (
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start h-full p-10">
        {!authenticated && (
          <div className="bg-white border-black border-[1px] rounded flex w-full p-2">
            <Input
              type="text"
              className='border-0 focus-visible:ring-0'
              placeholder="Senha"
              value={password}
              onChange={handlePasswordChange}
            />
            <Button className="hover:bg-gray-600" onClick={handleConfirmation}>Confirmar</Button>
          </div>
        )}
        {authenticated && guests?.data && (
          <>
            <h1 className="text-4xl font-sans font-bold">Lista de convidados:</h1>
            <div className="bg-white rounded w-full overflow-x-auto">
              <GuestListTable guests={guests.data} />
            </div>
          </>
        )}
      </main>
    );
  }

  return <Skeleton className="w-full h-[500px]" />;
}
