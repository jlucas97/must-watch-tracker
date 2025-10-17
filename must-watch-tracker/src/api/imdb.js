const API_KEY = import.meta.env.VITE_OMDB_KEY; // store this in .env
const BASE_URL = "https://www.omdbapi.com/";

import noImage from "../assets/no-image.svg";


export async function searchImdb(query) {
  // Skip invalid/short queries
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query.trim())}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`OMDb API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();

    // OMDb returns { Search: [], totalResults: "N", Response: "True/False" }
    if (data.Response === "False" || !Array.isArray(data.Search)) {
      return [];
    }

    // Normalize to the card format
    return data.Search.map((r) => ({
      id: r.imdbID,
      title: r.Title,
      genres: r.Type, 
      rating: "N/A",
      year: r.Year,
      image: r.Poster !== "N/A" ? r.Poster : noImage,
      type: r.Type,
    }));
  } catch (err) {
    console.error("OMDb fetch failed:", err);
    return [];
  }
}
