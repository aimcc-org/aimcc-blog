const key = (id: number) => `aimcc:article-bookmark:${id}`;

export function readBookmark(id: number): boolean {
  try {
    return localStorage.getItem(key(id)) === "1";
  } catch {
    return false;
  }
}

export function saveBookmark(id: number, saved: boolean): void {
  try {
    if (saved) localStorage.setItem(key(id), "1");
    else localStorage.removeItem(key(id));
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}
