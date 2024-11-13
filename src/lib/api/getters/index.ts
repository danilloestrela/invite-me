export const fetchGuest = async (slug: string) => {
  return fetch(`/api/guests/${slug}`).then((res) => res.json());
}

export const fetchGuests = async () => {
  return fetch('/api/guests').then((res) => res.json());
}

