import { useEffect, useState } from "react";
import { Button } from "@aimcc/react-component";
import { readBookmark, saveBookmark } from "../utils/article-bookmarks";
import "../styles/article-bookmark.less";

export default function ArticleBookmark({ articleId }: { articleId: number }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(readBookmark(articleId)), [articleId]);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="article-bookmark"
      aria-label={saved ? "取消本机收藏" : "收藏到本机"}
      aria-pressed={saved}
      onClick={() => {
        const next = !saved;
        setSaved(next);
        saveBookmark(articleId, next);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4Z" />
      </svg>
    </Button>
  );
}
