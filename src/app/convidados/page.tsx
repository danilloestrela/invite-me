'use client'

import { GuestListTable } from "@/components/GuestListTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuestStatus } from "@/constants/general";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGuests } from "@/hooks/useGuests";
import Loading from "../loading";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, login } = useAuth();
  const { guests, isLoading } = useGuests(
    {
      authenticated: isAuthenticated,
      status: GuestStatus.attending,
      pageSize: 9999
    });
  if (isLoading) return <Loading />;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      password: formData.get('password') as string,
      username: formData.get('username') as string
    };

    if (data.password && data.username) {
      await login(data);
    } else {
      toast({
        title: 'Dados inválidos',
        description: 'Certifique-se que a senha e o usuário são válidos.',
      });
      e.currentTarget.reset();
    }
  }

  if (!isLoading) {
    return (
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start h-full p-10">
        {!isAuthenticated && (
          <div className="flex flex-col gap-2 w-full h-full items-center justify-center">
            <form className="bg-white border-black border-[1px] rounded flex flex-col gap-2 w-full p-6 max-w-sm" onSubmit={handleLogin}>
              <Input
                type="text"
                name="username"
                className='border-0 focus-visible:ring-0'
                placeholder="Usuário"
                autoComplete="current-username"
              />
              <Input
                type="password"
                name="password"
                className='border-0 focus-visible:ring-0'
                placeholder="Senha"
                autoComplete="current-password"
              />
              <Button className="hover:bg-gray-600" type="submit">Confirmar</Button>
            </form>
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
        {
          isAuthenticated && !guests?.data && <Loading />
        }
      </main>
    );
  }
}
