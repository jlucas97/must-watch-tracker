import "./style.css";
import { searchTvMaze } from "./api/tvmaze.js";
import { searchImdb } from "./api/imdb.js";
import { watchlist as Watchlist } from "./storage/watchlist.js";

const watchlist = new Watchlist();


document.getElementById("appIcon").addEventListener("click", () => {
  renderWatchlist();
});


/* ---------- DOM Elements ---------- */
const input = document.getElementById("searchInput");
const resultsContainer = document.getElementById("results");

/* ---------- Render Searched Cards ---------- */
function renderCards(items) {
  resultsContainer.innerHTML = items
    .map(
      (i) => `
      <div class="bg-zinc-800 rounded-lg overflow-hidden shadow hover:scale-[1.02] transition">
        <img src="${i.image}" alt="${i.title}"
             class="w-full aspect-[2/3] object-contain bg-black rounded-t" />
        <div class="p-3 flex flex-col justify-between h-[10rem]">
          <h2 class="font-title text-lg">${i.title}</h2>
          <p class="text-sm text-zinc-300">${i.genres}</p>
          <p class="text-sm text-zinc-400">⭐ ${i.rating} · ${i.premiered ?? i.year ?? "—"}</p>
          <button class="mt-2 bg-primary hover:bg-red-700 rounded p-1 text-xs font-semibold"
                  data-item='${encodeURIComponent(JSON.stringify(i))}'>
            + Add to Watchlist
          </button>
        </div>
      </div>`
    )
    .join("");

  // attach "add" events
  resultsContainer.querySelectorAll("button[data-item]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const itemData = e.currentTarget.dataset.item || e.target.closest("button")?.dataset.item;
    if (!itemData) return;
    const item = JSON.parse(decodeURIComponent(itemData));
    watchlist.add(item);
    alert(`${item.title} added to watchlist!`);
  });
});

}

/* ---------- Handle Search ---------- */
input.addEventListener("keyup", async (e) => {
  const query = e.target.value.trim();
  if (query.length < 3) return;

  resultsContainer.innerHTML = `<p class="text-center mt-6">🔍 Searching...</p>`;

  try {
    const [series, movies] = await Promise.all([
      searchTvMaze(query),
      searchImdb(query),
    ]);
    renderCards([...movies, ...series]);
  } catch (err) {
    console.error(err);
    resultsContainer.innerHTML = `<p class="text-center text-red-400 mt-6">Error fetching data 😢</p>`;
  }
});

// Render the current watchlist items 
function renderWatchlist() {
  const items = watchlist.get();

  resultsContainer.innerHTML = items.length
    ? items
        .map(
          (i) => `
          <div class="relative bg-zinc-800 rounded-lg overflow-hidden shadow hover:scale-[1.02] transition">
            
            <!-- Floating remove button -->
            <button class="absolute top-2 right-2 bg-black/70 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition transform hover:scale-110"
                    data-remove="${i.id}" title="Remove">
              ✕
            </button>

            <!-- Poster -->
            <img src="${i.image}" alt="${i.title}"
                 class="w-full aspect-[2/3] object-cover bg-black rounded-t" />

            <!-- Info -->
            <div class="p-3 flex flex-col justify-between h-[12rem]">
              <h2 class="font-title text-lg leading-tight line-clamp-2">${i.title}</h2>
              <p class="text-sm text-zinc-300">${i.genres}</p>
              <p class="text-sm text-zinc-400">
                ⭐ ${i.rating} · ${i.premiered ?? i.year ?? "—"}
              </p>

              <!-- Watched toggle -->
              <button class="mt-2 text-xs px-2 py-1 rounded ${
                i.watched
                  ? "bg-green-700 hover:bg-green-600"
                  : "bg-gray-700 hover:bg-gray-600"
              } transition" data-toggle="${i.id}">
                ${i.watched ? "Watched " : "Mark as Watched"}
              </button>
            </div>
          </div>`
        )
        .join("")
    : `<p class="text-center text-gray-400 mt-10">No items in your watchlist.</p>`;

  // Delete button logic
  resultsContainer.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.remove;
      watchlist.remove(id);
      renderWatchlist();
    });
  });

  // Toggle watched logic
  resultsContainer.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.toggle;
      watchlist.toggleWatched(id);
      renderWatchlist();
    });
  });
}

