export const auth = {
    authenticate:  async ({username, password}: {username: string, password: string}): Promise<{message: string}> => {
        const fetchResponse = await fetch('/api/users/auth', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
        if(!fetchResponse.ok) {
          const errorResponse = await fetchResponse.json();
          throw new Error(errorResponse.message as string);
        }
        return fetchResponse.json();
    }
}