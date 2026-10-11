import ApiArticleCards from "../articles/ApiArticleCards";
import ArticlePagination from "./ArticlePagination";
import { useRecentArticles } from "./useRecentArticles";
import "./recent-articles.css";

export default function RecentArticles({
  tagId,
  categoryId,
}: {
  tagId?: number;
  categoryId?: number;
}) {
  const { page, loading, error, loadPage, retry } = useRecentArticles(
    tagId,
    categoryId,
  );
  return (
    <section
      className="recent-articles"
      aria-labelledby="recent-articles-title"
      aria-busy={loading}
    >
      <header className="recent-articles__header">
        <h2 id="recent-articles-title" className="home-posts__section-title">
          最近文章
        </h2>
        {page && <span>{page.total} 篇文章</span>}
      </header>
      <ApiArticleCards articles={page?.records ?? []} />
      {loading && (
        <p className="recent-articles__status" role="status">
          正在加载文章…
        </p>
      )}
      {error && (
        <div className="article-feedback" role="alert">
          <div className="article-feedback__body">
            <p>文章加载失败，请稍后重试。</p>
          </div>
          <button
            type="button"
            className="article-feedback__retry"
            disabled={loading}
            onClick={() => void retry()}
          >
            重新加载
          </button>
        </div>
      )}
      {!loading && !error && !page?.records.length && (
        <p className="recent-articles__status">当前筛选条件下暂无文章。</p>
      )}
      {!!page?.total && (
        <ArticlePagination
          current={page.current}
          totalPages={Math.ceil(page.total / page.size)}
          loading={loading}
          onChange={(number) => void loadPage(number)}
        />
      )}
    </section>
  );
}
