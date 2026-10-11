import type { HTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

export interface MarkdownReaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Markdown source. Raw HTML is deliberately disabled. */
  source: string;
}

/** Shared GFM renderer for published articles and editor previews. */
export function MarkdownReader({
  source,
  className = "",
  ...props
}: MarkdownReaderProps) {
  return (
    <div {...props} className={`aimcc-markdown ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSlug, { prefix: "md-" }]]}
        skipHtml
        components={{
          img: ({ node: _node, ...image }) => (
            <img {...image} loading="lazy" decoding="async" />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
