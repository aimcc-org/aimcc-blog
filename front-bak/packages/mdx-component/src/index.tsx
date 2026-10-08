import type { PropsWithChildren } from 'react';

export function MdxContainer({ children }: PropsWithChildren) {
  return <div className="mdx-content">{children}</div>;
}
