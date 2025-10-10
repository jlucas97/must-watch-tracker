import "./style.css";

//Hardcoded data for demo purposes
const data = [
  {
    title: "Batman Beyond",
    genres: "Action, Adventure",
    rating: 8.3,
    year: 1998,
    image:
      "https://static.tvmaze.com/uploads/images/medium_portrait/4/10842.jpg",
  },
  {
    title: "Breaking Bad",
    genres: "Drama, Crime",
    rating: 9.5,
    year: 2008,
    image:
      "https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg",
  },
  {
    title: "The Mandalorian",
    genres: "Action, Sci-Fi",
    rating: 8.7,
    year: 2019,
    image:
      "https://static.tvmaze.com/uploads/images/medium_portrait/501/1253498.jpg",
  },
  {
    title: "Stranger Things",
    genres: "Drama, Fantasy",
    rating: 8.8,
    year: 2016,
    image:
      "https://static.tvmaze.com/uploads/images/medium_portrait/200/501942.jpg",
  },
  {
    title: "La Casa de Papel",
    genres: "Action, Crime",
    rating: 8.0,
    year: 2017,
    image:
      "https://static.tvmaze.com/uploads/images/medium_portrait/376/940830.jpg",
  },
  {
    title: "Loki",
    genres: "Action, Adventure",
    rating: 8.4,
    year: 2021,
    image:
      "https://static.tvmaze.com/uploads/images/medium_portrait/478/1195717.jpg",
  },
];

function renderCards(items) {
  const container = document.getElementById("results");

  container.innerHTML = items
    .map(
      (i) => `
      <div class="bg-zinc-800 rounded-lg overflow-hidden shadow hover:scale-[1.02] transition">
        <img src="${i.image}" alt="${i.title}"
          class="w-full aspect-[2/3] object-contain bg-black rounded-t" />
          <h2 class="font-title text-lg sm:text-xl">${i.title}</h2>
          <p class="text-sm text-zinc-300">${i.genres}</p>
          <p class="text-sm text-zinc-400">⭐ ${i.rating} · ${i.year}</p>
        </div>
      </div>`
    )
    .join("");
}

renderCards(data);
