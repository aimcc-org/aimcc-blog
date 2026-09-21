import { useEffect, useState } from "react";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export default function HomeControls() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <>
      <div className="home-nav__actions" aria-label="首页操作">
        <button
          className="home-nav__icon-button"
          type="button"
          aria-label="打开搜索"
          onClick={() => setSearchOpen(true)}
        >
          <span aria-hidden="true">⌕</span>
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
          <span aria-hidden="true">{theme === "dark" ? "☾" : "☼"}</span>
        </button>
        <button
          className="home-nav__icon-button home-nav__menu-button"
          type="button"
          aria-label="打开导航菜单"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      <div className={`home-mobile-menu${menuOpen ? " is-open" : ""}`}>
        <a href="/">首页</a>
        <a href="/archive/">归档</a>
        <a href="/about/">关于</a>
      </div>

      {searchOpen && (
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
        </div>
      )}
    </>
  );
}
