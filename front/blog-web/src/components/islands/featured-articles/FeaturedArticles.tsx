import "./styles/featured-articles.less";
import { Button } from "@aimcc/react-component";
import FeaturedArticleCard from "./FeaturedArticleCard";
import FeaturedEmptyState from "./FeaturedEmptyState";
import FeaturedHeader from "./FeaturedHeader";
import { useFeaturedArticles } from "./useFeaturedArticles";
import "./featured-articles.less";

export default function FeaturedArticles() {
  const { page, loading, error, hasNext, hasPrevious, loadPage, retry } =
    useFeaturedArticles();
  const [first, ...rest] = page?.records ?? [];
  return (
    <section
      className="featured-articles"
      aria-labelledby="featured-title"
      aria-busy={loading}
    >
      <FeaturedHeader
        loading={loading}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onPrevious={() => void loadPage((page?.current ?? 1) - 1)}
        onNext={() => void loadPage((page?.current ?? 0) + 1)}
      />
      {first && (
        <div className="featured-articles__grid">
          <FeaturedArticleCard article={first} lead />
          {rest.length > 0 && (
            <ul className="featured-articles__list">
              {rest.map((article) => (
                <li key={article.id}>
                  <FeaturedArticleCard article={article} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!loading && !error && !first && <FeaturedEmptyState />}
      {error && (
        <div className="featured-articles__feedback" role="alert">
          <span>精选文章加载失败，请稍后重试。</span>
          <Button
            variant="ghost"
            className="featured-articles__retry"
            type="button"
            disabled={loading}
            onClick={() => void retry()}
          >
            重新加载
          </Button>
        </div>
      )}
      <span
        className="featured-articles__status"
        role="status"
        aria-live="polite"
      >
        {loading
          ? "正在加载精选文章…"
          : !error && !first
            ? "暂无精选文章。"
            : page
              ? `第 ${page.current} 页`
              : ""}
      </span>
    </section>
  );
}
