import { useId } from "react";
import type { CategoryItem } from "./CategoryList.js";

export interface CategoryIndexItem extends Omit<CategoryItem, "count"> {
  count: number;
}
export interface CategoryIndexProps {
  categories: CategoryIndexItem[];
  title?: string;
  className?: string;
}
/** One category level and its count; no nested articles or expansion. */
export function CategoryIndex({
  categories,
  title = "分类",
  className = "",
}: CategoryIndexProps) {
  const id = useId();
  return (
    <section
      className={`category-index ${className}`.trim()}
      aria-labelledby={id}
    >
      <header>
        <div>
          <span>INDEX</span>
          <h2 id={id}>{title}</h2>
        </div>
      </header>
      {categories.length > 0 ? (
        <ul>
          {categories.map((item, index) => {
            const contents = (
              <>
                <span className="category-index__name">{item.name}</span>
                <span
                  className="category-index__count"
                  aria-label={`${item.count} 篇文章`}
                >
                  {String(item.count).padStart(2, "0")}
                </span>
              </>
            );
            return (
              <li key={index}>
                {item.href ? (
                  <a
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                  >
                    {contents}
                  </a>
                ) : (
                  <div className={item.active ? "is-active" : undefined}>
                    {contents}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>暂无分类</p>
      )}
    </section>
  );
}
