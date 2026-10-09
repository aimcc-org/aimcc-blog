import { useEffect, useState } from "react";
import { readTagIds, readCategoryId } from "@/lib/tag-filter";
import ArticleTimelineFeed from "./ArticleTimelineFeed";

export default function TagArticleResults() {
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [categoryId, setCategoryId] = useState<number>();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const syncTag = () => {
      const next = readTagIds(window.location.search);
      setReady(true);
      setCategoryId(readCategoryId(window.location.search));
      setTagIds((previous) =>
        previous.join(",") === next.join(",") ? previous : next,
      );
    };
    syncTag();
    document.addEventListener("astro:page-load", syncTag);
    window.addEventListener("popstate", syncTag);
    window.addEventListener("aimcc:tag-filter-change", syncTag);
    return () => {
      document.removeEventListener("astro:page-load", syncTag);
      window.removeEventListener("popstate", syncTag);
      window.removeEventListener("aimcc:tag-filter-change", syncTag);
    };
  }, []);
  return !ready ? null : (
    <div>
      <ArticleTimelineFeed
        key={`${categoryId ?? ""}:${tagIds.join(",")}`}
        tagIds={tagIds}
        categoryId={categoryId}
        variant="cards"
      />
    </div>
  );
}
