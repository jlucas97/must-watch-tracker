const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://imdb8.p.rapidapi.com/title/v2/find";
const HOST = "imdb8.p.rapidapi.com";

import noImage from "../assets/no-image.svg";

export async function searchImdb(query) {
  try {
    const res = await fetch(
      `${BASE_URL}?title=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": HOST,
        },
      }
    );

    if (!res.ok) {
      console.error("IMDb API Error:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();

    return (
      data.results
        ?.filter((r) => r.title && r.image)
        .map((r) => ({
          id: r.id,
          title: r.title,
          genres: r.genres?.join(", ") || "—",
          rating: r.ratingsSummary?.aggregateRating ?? r.rating ?? "N/A",
          year: r.year || "—",
          image: r.image?.url || noImage,
          type: "movie",
        })) ?? []
    );
  } catch (err) {
    console.error("IMDb fetch failed:", err);
    return [];
  }
}
