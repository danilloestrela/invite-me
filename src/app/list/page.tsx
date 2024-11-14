'use client'

import { GuestListTable } from "@/components/GuestListTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGuests } from "@/hooks/useGuests";
import { useRef } from "react";
import Loading from "../loading";

export default function Home() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isAuthenticated, login, securePassword } = useAuth();
  const { guests, isLoading } = useGuests(isAuthenticated);


  if (isLoading) return <Loading />;

  const handleLogin = async () => {
    if (passwordRef.current && securePassword(passwordRef.current.value)) {
      await login({ username: 'admin', password: passwordRef.current.value });
    } else {
      if (passwordRef.current) {
        passwordRef.current.focus();
        passwordRef.current.value = '';
        toast({
          title: 'Senha inválida',
          description: 'Certifique-se que a senha é válida.',
        });
      }
    }
  }

  if (!isLoading) {
    return (
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start h-full p-10">
        {!isAuthenticated && (
          <div className="bg-white border-black border-[1px] rounded flex w-full p-2">
            <Input
              type="text"
              className='border-0 focus-visible:ring-0'
              placeholder="Senha"
              ref={passwordRef}
            />
            <Button className="hover:bg-gray-600" onClick={handleLogin}>Confirmar</Button>
          </div>
        )}
        {isAuthenticated && guests?.data && (
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
}
