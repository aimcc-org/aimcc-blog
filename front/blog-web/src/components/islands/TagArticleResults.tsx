import { useEffect, useState } from "react";
import { readTagIds } from "@/lib/tag-filter";
import ArticleTimelineFeed from "./ArticleTimelineFeed";

export default function TagArticleResults() {
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [localCategory, setLocalCategory] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const syncTag = () => {
      const next = readTagIds(window.location.search);
      setReady(true);
      setLocalCategory(
        next.length === 0 &&
          !!new URLSearchParams(window.location.search).get("category"),
      );
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
  return !ready || localCategory ? null : (
    <div>
      <ArticleTimelineFeed
        key={tagIds.join(",")}
        tagIds={tagIds}
        variant="cards"
      />
    </div>
  );
}
