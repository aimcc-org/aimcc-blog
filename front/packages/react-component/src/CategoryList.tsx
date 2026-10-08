import { useId } from "react";

export interface CategoryItem {
  name: string;
  count?: number;
  href?: string;
  active?: boolean;
}

export interface CategoryListProps {
  categories: CategoryItem[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

/** Render links only when the host supplies a category destination. */
export function CategoryList({
  categories,
  title = "分类",
  emptyMessage = "暂无分类",
  className = "",
}: CategoryListProps) {
  const titleId = useId();
  return (
    <section
      className={`category-list ${className}`.trim()}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="category-list__title">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z" />
        </svg>
        {title}
      </h2>
      {categories.length > 0 ? (
        <ul className="category-list__items">
          {categories.map((item, index) => {
            const contents = (
              <>
                <span className="category-list__name">{item.name}</span>
                {item.count !== undefined && (
                  <span
                    className="category-list__count"
                    aria-label={`${item.count} 篇文章`}
                  >
                    {item.count}
                  </span>
                )}
              </>
            );
            const rowClass = `category-list__row${item.active ? " is-active" : ""}`;
            return (
              <li key={`${item.name}-${index}`}>
                {item.href ? (
                  <a
                    className={rowClass}
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                  >
                    {contents}
                  </a>
                ) : (
                  <div className={rowClass}>{contents}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="category-list__empty">{emptyMessage}</p>
      )}
    </section>
  );
}
