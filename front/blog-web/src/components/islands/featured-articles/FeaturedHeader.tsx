import "./styles/featured-header.less";
import { Button } from "@aimcc/react-component";
interface Props {
  loading: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function FeaturedHeader({
  loading,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: Props) {
  return (
    <header className="featured-articles__header">
      <div className="featured-articles__heading">
        <h2 id="featured-title">精选文章</h2>
        <span lang="en">FEATURED ARTICLES</span>
      </div>
      <nav className="featured-articles__pagination" aria-label="精选文章分页">
        {hasPrevious && (
          <Button
            variant="ghost"
            className="featured-header__previous"
            type="button"
            disabled={loading}
            onClick={onPrevious}
          >
            <span aria-hidden="true">←</span> 前一页
          </Button>
        )}
        <Button
          variant="ghost"
          className="featured-header__next"
          type="button"
          disabled={loading || !hasNext}
          onClick={onNext}
        >
          下一页 <span aria-hidden="true">→</span>
        </Button>
      </nav>
    </header>
  );
}
