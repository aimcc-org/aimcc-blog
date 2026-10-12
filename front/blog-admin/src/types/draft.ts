export interface Draft {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string;
  categoryId?: number | null;
  tagIds?: number[];
  publishedArticleId?: number;
  slug: string;
  cover: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DraftStore {
  version: 1;
  activeId: string;
  drafts: Draft[];
}
