import "../styles/index.less";

export default function FeaturedEmptyState() {
  return (
    <div className="featured-empty-state">
      <svg
        viewBox="0 0 80 64"
        width="80"
        height="64"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="17"
          y="10"
          width="44"
          height="48"
          rx="7"
          fill="currentColor"
          opacity=".08"
        />
        <rect
          x="24"
          y="5"
          width="40"
          height="48"
          rx="6"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M34 20h20M34 29h20M34 38h12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".5"
        />
        <path
          d="m13 26 1.6 4.4L19 32l-4.4 1.6L13 38l-1.6-4.4L7 32l4.4-1.6L13 26Z"
          fill="currentColor"
          opacity=".5"
        />
      </svg>
      <h3>暂无精选文章</h3>
      <p>当前分类下还没有精选内容，不妨看看下方的最近文章。</p>
    </div>
  );
}
