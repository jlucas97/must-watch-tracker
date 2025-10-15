import noImage from '../assets/no-image.svg';

export async function searchTvMaze(query) {
  const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  return data.map(item => ({
    id: item.show.id,
    title: item.show.name,
    genres: item.show.genres.join(', '),
    rating: item.show.rating?.average ?? 'N/A',
    premiered: item.show.premiered ?? '—',
    image: item.show.image?.medium ?? noImage,
    summary: (item.show.summary || '').replace(/<[^>]+>/g, ''),
    type: 'series',
  }));
}
