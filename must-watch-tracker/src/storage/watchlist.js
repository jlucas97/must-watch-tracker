const STORAGE_KEY = "watchlist";

//CRUD operations for watchlist in localStorage

export class watchlist {
  constructor(storageKey = "watchlist") {
    this.key = storageKey;
  }

  get() {
    return JSON.parse(localStorage.getItem(this.key) || "[]");
  }

  save(list) {
    localStorage.setItem(this.key, JSON.stringify(list));
  }

  add(item) {
    const list = this.get();
    const exists = list.find((x) => x.id === item.id);

    if (!exists) {
      list.push({ ...item, watched: false });
      this.save(list);
    }
  }

  toggleWatched(id) {
    const list = this.get();
    const index = list.findIndex((x) => String(x.id) === String(id)); // 👈 normalize
    if (index !== -1) {
      list[index].watched = !list[index].watched;
      this.save(list);
    }
  }

  remove(id) {
    const list = this.get().filter((x) => String(x.id) !== String(id)); // 👈 normalize
    this.save(list);
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}
