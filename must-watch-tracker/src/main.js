import "./style.css";
import { searchTvMaze } from "./api/tvmaze.js";
import { searchImdb } from "./api/imdb.js";
import { watchlist as Watchlist } from "./storage/watchlist.js";

// ------------------------------------------------------------
// USER MANAGEMENT (Profile Dropdown)
// ------------------------------------------------------------
const USERS = ["Lucas", "Janaína", "Tony"];
let currentUserIndex = 0;
let currentUser = USERS[currentUserIndex];

// Profile DOM Elements
const profileInitial = document.getElementById("profileInitial");
const dropdown = document.getElementById("userDropdown");
const profileBtn = document.getElementById("profileBtn");

// Initialize display
function updateProfileDisplay() {
  profileInitial.textContent = currentUser[0].toUpperCase();
}
updateProfileDisplay();

// Initialize user-specific watchlist
let watchlist = new Watchlist(`watchlist_${currentUser}`);

// Build dropdown menu with user names
function renderUserDropdown() {
  dropdown.innerHTML = USERS.map(
    (u, index) => `
      <button class="block w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition"
              data-user="${index}">
        ${u}
      </button>
    `
  ).join("");
}
renderUserDropdown();

// Toggle dropdown visibility
profileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("hidden");
});

// Switch user from dropdown
dropdown.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-user]");
  if (!btn) return;
  const index = Number(btn.dataset.user);
  if (index === currentUserIndex) return;

  currentUserIndex = index;
  currentUser = USERS[currentUserIndex];
  updateProfileDisplay();

  watchlist = new Watchlist(`watchlist_${currentUser}`);
  renderWatchlist();
  dropdown.classList.add("hidden");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!document.getElementById("profileContainer").contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

// ------------------------------------------------------------
// GLOBAL DOM ELEMENTS
// ------------------------------------------------------------
const input = document.getElementById("searchInput");
const resultsContainer = document.getElementById("results");
const appIcon = document.getElementById("appIcon");

// ------------------------------------------------------------
// FILTER STATE
// ------------------------------------------------------------
const filters = {
  type: "all",
  genre: "all",
  watched: "all",
};

// ------------------------------------------------------------
// WATCHLIST HELPERS
// ------------------------------------------------------------
function getFilteredWatchlist() {
  let items = watchlist.get();

  if (filters.type !== "all") {
    items = items.filter((i) => i.type === filters.type);
  }

  if (filters.watched !== "all") {
    const wantWatched = filters.watched === "watched";
    items = items.filter((i) => Boolean(i.watched) === wantWatched);
  }

  if (filters.genre !== "all") {
    const g = filters.genre.toLowerCase();
    items = items.filter((i) => (i.genres || "").toLowerCase().includes(g));
  }

  return items;
}

// ------------------------------------------------------------
// RENDER SEARCH RESULTS
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// SEARCH HANDLING (Debounced & Case-insensitive)
// ------------------------------------------------------------
let debounceTimer;
input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = input.value.trim();

  if (query.length < 2) {
    resultsContainer.innerHTML = `<p class="text-center mt-6 text-gray-400">Type at least 2 characters to search.</p>`;
    return;
  }

  debounceTimer = setTimeout(async () => {
    resultsContainer.innerHTML = `<p class="text-center mt-6">Searching...</p>`;

    try {
      const [series, movies] = await Promise.all([
        searchTvMaze(query),
        searchImdb(query),
      ]);

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
      resultsContainer.innerHTML = `<p class="text-center text-red-400 mt-6">Error fetching data</p>`;
    }
  }, 500);
});

// ------------------------------------------------------------
// WATCHLIST RENDERING
// ------------------------------------------------------------
function renderWatchlist() {
  const items = getFilteredWatchlist();

  resultsContainer.innerHTML = items.length
    ? items
        .map(
          (i) => `
          <div class="relative bg-zinc-800 rounded-lg overflow-hidden shadow hover:scale-[1.02] transition">
            <button class="absolute top-2 right-2 bg-black/70 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition transform hover:scale-110"
                    data-remove="${i.id}" title="Remove">
              ✕
            </button>
            <img src="${i.image}" alt="${i.title}"
                 class="w-full aspect-[2/3] object-cover bg-black rounded-t" />
            <div class="p-3 flex flex-col justify-between h-[12rem]">
              <h2 class="font-title text-lg leading-tight line-clamp-2">${i.title}</h2>
              <p class="text-sm text-zinc-300">${i.genres}</p>
              <p class="text-sm text-zinc-400">
                ⭐ ${i.rating} · ${i.premiered ?? i.year ?? "—"}
              </p>
              <button class="mt-2 text-xs px-2 py-1 rounded ${
                i.watched
                  ? "bg-green-700 hover:bg-green-600"
                  : "bg-gray-700 hover:bg-gray-600"
              } transition" data-toggle="${i.id}">
                ${i.watched ? "Watched" : "Mark as Watched"}
              </button>
            </div>
          </div>`
        )
        .join("")
    : `<p class="text-center text-gray-400 mt-10">No items in your watchlist.</p>`;

  resultsContainer.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.remove;
      watchlist.remove(id);
      renderWatchlist();
    });
  });

  resultsContainer.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.toggle;
      watchlist.toggleWatched(id);
      renderWatchlist();
    });
  });
}

// ------------------------------------------------------------
// APP ICON CLICK → WATCHLIST VIEW
// ------------------------------------------------------------
appIcon.addEventListener("click", () => {
  renderWatchlist();
});

// ------------------------------------------------------------
// FILTER CONTROLS
// ------------------------------------------------------------
document.getElementById("filterAll").addEventListener("click", () => {
  filters.type = "all";
  renderWatchlist();
});
document.getElementById("filterMovies").addEventListener("click", () => {
  filters.type = "movie";
  renderWatchlist();
});
document.getElementById("filterSeries").addEventListener("click", () => {
  filters.type = "series";
  renderWatchlist();
});
document.getElementById("filterWatched").addEventListener("click", () => {
  filters.watched = "watched";
  renderWatchlist();
});
document.getElementById("filterUnwatched").addEventListener("click", () => {
  filters.watched = "unwatched";
  renderWatchlist();
});
document.getElementById("filterReset").addEventListener("click", () => {
  filters.watched = "all";
  filters.type = "all";
  filters.genre = "all";
  renderWatchlist();
});
document.querySelectorAll("[data-category]").forEach((btn) =>
  btn.addEventListener("click", () => {
    filters.genre = btn.dataset.category;
    renderWatchlist();
  })
);
