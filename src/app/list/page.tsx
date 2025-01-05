'use client'

import { GuestListTable } from "@/components/GuestListTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGuests } from "@/hooks/useGuests";
import Loading from "../loading";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, login } = useAuth();
  const { guests, isLoading } = useGuests(isAuthenticated);


  if (isLoading) return <Loading />;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    if (password) {
      await login({ username: 'admin', password });
    } else {
      toast({
        title: 'Senha inválida',
        description: 'Certifique-se que a senha é válida.',
      });
      e.currentTarget.reset();
    }
  }

  if (!isLoading) {
    return (
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start h-full p-10">
        {!isAuthenticated && (
          <form className="bg-white border-black border-[1px] rounded flex w-full p-2" onSubmit={handleLogin}>
            <Input
              type="password"
              name="password"
              className='border-0 focus-visible:ring-0'
              placeholder="Senha"
            />
            <Button className="hover:bg-gray-600" type="submit">Confirmar</Button>
          </form>
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
