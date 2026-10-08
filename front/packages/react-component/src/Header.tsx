import type { ReactNode } from "react";

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
}

/** Header contents; positioning and page-specific actions belong to the host. */
export function Header({
  title,
  homeHref = "/",
  mark = "A",
  links = [],
  actions,
  className = "",
}: HeaderProps) {
  return (
    <div className={`home-nav ${className}`.trim()}>
      <a
        className="home-nav__brand"
        href={homeHref}
        aria-label={`${title} 首页`}
      >
        <span className="home-nav__mark">{mark}</span>
        <span>{title}</span>
      </a>
      {links.length > 0 && (
        <nav className="home-nav__links" aria-label="主导航">
          {links.map(({ href, label, active }) => (
            <a
              key={href}
              href={href}
              className={active ? "is-active" : undefined}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
      {actions}
    </div>
  );
}
