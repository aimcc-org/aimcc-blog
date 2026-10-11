import { useId } from "react";
export interface QuickLink {
  label: string;
  href: string;
  external?: boolean;
}
export interface QuickLinksProps {
  links: QuickLink[];
  title?: string;
}
export function QuickLinks({ links, title = "快捷入口" }: QuickLinksProps) {
  const id = useId();
  return (
    <nav className="rc-panel rc-quick-links" aria-labelledby={id}>
      <h2 id={id} className="rc-eyebrow">
        {title}
      </h2>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
        >
          {link.label}
          <span aria-hidden="true">{link.external ? "↗" : "→"}</span>
        </a>
      ))}
      {links.length === 0 && <p className="rc-muted">暂无链接</p>}
    </nav>
  );
}
