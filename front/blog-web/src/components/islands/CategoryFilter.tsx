import { useEffect, useState } from "react";
import { CategoryIndex } from "@aimcc/react-component";
import { getCategories } from "@/lib/api";
import type { ApiCategory } from "@/lib/api";
import {
  readCategoryId,
  readTagIds,
  toggleCategoryHref,
} from "@/lib/tag-filter";

export default function CategoryFilter() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoryId, setCategoryId] = useState<number>();
  const [tagIds, setTagIds] = useState<number[]>([]);
  useEffect(() => {
    const syncFilter = () => {
      setCategoryId(readCategoryId(window.location.search));
      setTagIds(readTagIds(window.location.search));
    };
    syncFilter();
    document.addEventListener("astro:page-load", syncFilter);
    window.addEventListener("popstate", syncFilter);
    window.addEventListener("aimcc:tag-filter-change", syncFilter);
    const controller = new AbortController();
    void getCategories(controller.signal).then((result) => {
      if (!controller.signal.aborted) setCategories(result);
    });
    return () => {
      controller.abort();
      document.removeEventListener("astro:page-load", syncFilter);
      window.removeEventListener("popstate", syncFilter);
      window.removeEventListener("aimcc:tag-filter-change", syncFilter);
    };
  }, []);
  return (
    <CategoryIndex
      title="分类"
      categories={categories.map((category) => ({
        name: category.name,
        count: category.articleCount,
        href: toggleCategoryHref(categoryId, category.id, tagIds),
        active: categoryId === category.id,
      }))}
      onCategoryClick={(item, event) => {
        if (
          window.location.pathname !== "/" ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        window.history.pushState(null, "", item.href);
        window.dispatchEvent(new Event("aimcc:tag-filter-change"));
      }}
    />
  );
}
