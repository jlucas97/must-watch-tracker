import "./style.css";
import { searchTvMaze } from "./api/tvmaze.js";
import { searchImdb } from "./api/imdb.js";
import { watchlist as Watchlist } from "./storage/watchlist.js";

const watchlist = new Watchlist();

/* ---------- DOM Elements ---------- */
const input = document.getElementById("searchInput");
const resultsContainer = document.getElementById("results");
const appIcon = document.getElementById("appIcon");

/* ---------- Event: Logo click → render watchlist ---------- */
appIcon.addEventListener("click", () => {
  renderWatchlist();
});

/* ---------- Render Cards (search results) ---------- */
function renderCards(items) {
  resultsContainer.innerHTML = items
    .map(
      (i) => `
      <div class="bg-zinc-800 rounded-lg overflow-hidden shadow hover:scale-[1.02] transition">
        <img src="${i.image}" alt="${i.title}"
             class="w-full aspect-[2/3] object-cover bg-black rounded-t" />
        <div class="p-3 flex flex-col justify-between h-[10rem]">
          <h2 class="font-title text-lg leading-tight line-clamp-2">${i.title}</h2>
          <p class="text-sm text-zinc-300">${i.genres}</p>
          <p class="text-sm text-zinc-400">⭐ ${i.rating} · ${i.premiered ?? i.year ?? "—"}</p>
          <button class="mt-2 bg-primary hover:bg-red-700 rounded p-1 text-xs font-semibold"
                  data-id="${i.id}">
            + Add to Watchlist
          </button>
        </div>
      </div>`
    )
    .join("");

  // Attach Add-to-Watchlist logic
  resultsContainer.querySelectorAll("[data-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      const item = items.find((m) => String(m.id) === String(id));
      if (item) {
        watchlist.add(item);
        alert(`${item.title} added to Watchlist!`);
      }
    });
  });
}

/* ---------- Debounced + Fuzzy Search ---------- */
let debounceTimer;
input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = input.value.trim();

  // Require at least 2 characters
  if (query.length < 2) {
    resultsContainer.innerHTML = `<p class="text-center mt-6 text-gray-400">Type at least 2 characters to search.</p>`;
    return;
  }

  // Debounce actual search call
  debounceTimer = setTimeout(async () => {
    resultsContainer.innerHTML = `<p class="text-center mt-6">🔍 Searching...</p>`;

    try {
      const [series, movies] = await Promise.all([
        searchTvMaze(query),
        searchImdb(query),
      ]);

      // Combine results, then filter loosely (case-insensitive substring)
      const combined = [...movies, ...series].filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );

      if (combined.length === 0) {
        resultsContainer.innerHTML = `<p class="text-center text-gray-400 mt-6">No matches found for "${query}". Try a broader term.</p>`;
      } else {
        renderCards(combined);
      }
    } catch (err) {
      console.error(err);
      resultsContainer.innerHTML = `<p class="text-center text-red-400 mt-6">Error fetching data </p>`;
    }
  }, 500); // wait 0.5s after user stops typing
});

/* ---------- Render Watchlist ---------- */
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

  // Remove item
  resultsContainer.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.remove;
      watchlist.remove(id);
      renderWatchlist();
    });
  });

  // Toggle watched
  resultsContainer.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.toggle;
      watchlist.toggleWatched(id);
      renderWatchlist();
    });
  });
}
