import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createGlassMap } from "./header-glass.js";

export interface NavigationLink {
  href: string;
  label: string;
  active?: boolean;
}
export interface HeaderProps {
  title: string;
  homeHref?: string;
  mark?: ReactNode;
  links?: NavigationLink[];
  actions?: ReactNode;
  className?: string;
  overlay?: boolean;
  tone?: "default" | "inverse";
  /** Force a presentation state for previews; otherwise follows window scroll. */
  scrolled?: boolean;
}

export function Header({
  title,
  homeHref = "/",
  mark,
  links = [],
  actions,
  className = "",
  overlay = false,
  tone = "default",
  scrolled,
}: HeaderProps) {
  const id = useId().replace(/:/g, "");
  const filterId = `header-glass-${id}`;
  const menuId = `header-menu-${id}`;
  const headerRef = useRef<HTMLElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const [pastTop, setPastTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [glassMap, setGlassMap] = useState<{
    url: string;
    width: number;
    height: number;
  }>();
  const floating = scrolled ?? pastTop;

  useEffect(() => {
    if (scrolled !== undefined) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setPastTop(window.scrollY > 40);
    };
    update();
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [scrolled]);

  useEffect(() => {
    // SVG backdrop filters are an enhancement. Blur/highlights remain the baseline.
    if (!floating || !/Chrome|Chromium|Edg\//.test(navigator.userAgent)) return;
    const layer = glassRef.current;
    if (!layer) return;
    let timer = 0;
    let lastSize = "";
    const update = () => {
      const width = Math.round(layer.clientWidth);
      const height = Math.round(layer.clientHeight);
      const size = `${width}x${height}`;
      if (!width || !height || size === lastSize) return;
      lastSize = size;
      setGlassMap({ url: createGlassMap(width, height), width, height });
    };
    update();
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(update, 80);
    });
    observer.observe(layer);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [floating]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        headerRef.current
          ?.querySelector<HTMLButtonElement>(".site-header__menu-toggle")
          ?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("keydown", keydown);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("pointerdown", outside);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={`site-header${floating ? " is-floating" : ""}${tone === "inverse" && !floating ? " is-inverse" : ""} ${className}`.trim()}
      >
        {glassMap && (
          <svg
            className="site-header__filter"
            aria-hidden="true"
            width="0"
            height="0"
          >
            <defs>
              <filter
                id={filterId}
                x="0"
                y="0"
                width="100%"
                height="100%"
                colorInterpolationFilters="sRGB"
              >
                <feImage
                  href={glassMap.url}
                  width={glassMap.width}
                  height={glassMap.height}
                  result="map"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="map"
                  scale="18"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
                <feGaussianBlur stdDeviation="0.65" />
              </filter>
            </defs>
          </svg>
        )}
        <div
          ref={glassRef}
          className={`site-header__glass${glassMap && floating ? " has-refraction" : ""}`}
          style={
            { "--header-refraction": `url(#${filterId})` } as CSSProperties
          }
          aria-hidden="true"
        />
        <div className="site-header__content">
          <a
            className="site-header__brand"
            href={homeHref}
            aria-label={`${title} 首页`}
          >
            {mark && <span className="site-header__mark">{mark}</span>}
            <span>{title}</span>
          </a>
          {links.length > 0 && (
            <nav className="site-header__links" aria-label="主导航">
              {links.map(({ href, label, active }) => (
                <a
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </a>
              ))}
            </nav>
          )}
          <div className="site-header__actions">
            {actions}
            {links.length > 0 && (
              <button
                type="button"
                className="site-header__menu-toggle"
                aria-label={menuOpen ? "关闭导航菜单" : "打开导航菜单"}
                aria-controls={menuId}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  {menuOpen ? (
                    <path d="m6 6 12 12M6 18 18 6" />
                  ) : (
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
        <nav
          id={menuId}
          className="site-header__mobile"
          aria-label="移动端导航"
          hidden={!menuOpen}
        >
          {links.map(({ href, label, active }) => (
            <a
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>
      {!overlay && <div className="site-header__spacer" aria-hidden="true" />}
    </>
  );
}
