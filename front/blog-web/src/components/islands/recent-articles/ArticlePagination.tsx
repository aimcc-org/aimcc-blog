interface Props {
  current: number;
  totalPages: number;
  loading: boolean;
  onChange: (page: number) => void;
}
export default function ArticlePagination({
  current,
  totalPages,
  loading,
  onChange,
}: Props) {
  return (
    <nav className="recent-pagination" aria-label="最近文章分页">
      <span className="recent-pagination__count" aria-live="polite">
        第 <strong>{current}</strong> / {totalPages} 页
      </span>
      <div className="recent-pagination__actions">
        <button
          type="button"
          disabled={loading || current <= 1}
          onClick={() => onChange(current - 1)}
        >
          <span aria-hidden="true">←</span> 前一页
        </button>
        <button
          type="button"
          disabled={loading || current >= totalPages}
          onClick={() => onChange(current + 1)}
        >
          下一页 <span aria-hidden="true">→</span>
        </button>
      </div>
    </nav>
  );
}
