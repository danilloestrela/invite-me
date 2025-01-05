export async function POST(request: Request) {
  const res = await request.json();
  const { username, password } = res;
  if(!username || !password) {
    return Response.json({ message: 'No username or password provided' }, { status: 400 });
  }

  if (username !== 'admin' || password !== process.env.PASSWORD) {
    return Response.json({ message: 'Invalid username or password' }, { status: 401 });
  }

  return Response.json({ message: 'Authenticated' }, { status: 200 });
}