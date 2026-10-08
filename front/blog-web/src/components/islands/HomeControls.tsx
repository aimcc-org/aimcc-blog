import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export default function HomeControls() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <>
      <div className="home-nav__actions" aria-label="导航操作">
        <button
          className="home-nav__icon-button"
          type="button"
          aria-label="打开搜索"
          onClick={() => setSearchOpen(true)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
        </button>
        <button
          className="home-nav__icon-button"
          type="button"
          aria-label={`切换到${nextTheme === "dark" ? "深色" : "浅色"}模式`}
          onClick={() => {
            applyTheme(nextTheme);
            setTheme(nextTheme);
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            {theme === "dark" ? (
              <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
              </>
            )}
          </svg>
        </button>
      </div>

      {searchOpen &&
        createPortal(
          <div
            className="home-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-search-title"
          >
            <button
              className="home-dialog__backdrop"
              type="button"
              aria-label="关闭搜索"
              onClick={() => setSearchOpen(false)}
            />
            <section className="home-dialog__panel">
              <div className="home-dialog__header">
                <h2 id="home-search-title">Search</h2>
                <button
                  className="home-nav__icon-button"
                  type="button"
                  aria-label="关闭搜索"
                  onClick={() => setSearchOpen(false)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <input
                className="home-dialog__input"
                placeholder="Search is coming soon"
                disabled
              />
              <p>搜索入口已预留，后续可以接入 Pagefind 或服务端搜索 API。</p>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
