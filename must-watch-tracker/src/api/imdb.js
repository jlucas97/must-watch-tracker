const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const BASE_URL = 'https://imdb8.p.rapidapi.com/title/v2/find';

import noImage from '../assets/no-image.svg';

export async function searchImdb(query) {
  const res = await fetch(
    `https://imdb8.p.rapidapi.com/title/v2/find?title=${encodeURIComponent(query)}&limit=10`,
    { headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'imdb8.p.rapidapi.com' } }
  );

  const data = await res.json();

  return data.results
    ?.filter(r => r.title && r.image)
    .map(r => ({
      id: r.id,
      title: r.title,
      genres: r.genres?.join(', ') || '—',
      rating: r.ratingsSummary?.aggregateRating ?? r.rating ?? 'N/A',
      year: r.year || '—',
      image: r.image?.url || noImage,
      type: 'movie',
    })) ?? [];
}
