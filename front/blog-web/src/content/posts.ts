import { getCollection, type CollectionEntry } from 'astro:content';
import { currentProfile } from '@/config/build-profile';
import type { ContentOwner } from '@/types/profile';

export type SiteContentEntry = CollectionEntry<'content'>;

interface ParsedContentId {
  owner: ContentOwner;
  kind: string;
  slug: string;
}

export function parseContentId(id: string): ParsedContentId | null {
  const parts = id.replace(/\\/g, '/').split('/').filter(Boolean);
  if (parts.length < 3) return null;

  const [owner, kind, ...rest] = parts;
  if (!['main', 'shared'].includes(owner)) return null;

  const rawSlug = rest.join('/').replace(/\.(md|mdx)$/i, '').replace(/\/index$/i, '');
  return {
    owner: owner as ContentOwner,
    kind,
    slug: rawSlug,
  };
}

function ownerPriority(owner: ContentOwner) {
  const index = currentProfile.content.owners.indexOf(owner);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export async function getProfilePosts(options: { includeDrafts?: boolean } = {}) {
  const entries = await getCollection('content');
  const candidates = entries
    .map((entry) => ({ entry, meta: parseContentId(entry.id) }))
    .filter((item): item is { entry: SiteContentEntry; meta: ParsedContentId } => Boolean(item.meta))
    .filter(({ meta }) => meta.kind === 'posts')
    .filter(({ meta }) => currentProfile.content.owners.includes(meta.owner))
    .filter(({ entry }) => options.includeDrafts || !entry.data.draft)
    .sort((a, b) => ownerPriority(a.meta.owner) - ownerPriority(b.meta.owner));

  // Profile owner wins over shared when slugs collide.
  const bySlug = new Map<string, { entry: SiteContentEntry; meta: ParsedContentId }>();
  for (const item of candidates) {
    if (!bySlug.has(item.meta.slug)) bySlug.set(item.meta.slug, item);
  }

  return [...bySlug.values()].sort(
    (a, b) => b.entry.data.published.getTime() - a.entry.data.published.getTime(),
  );
}

export async function getProfilePage(slug: string) {
  const entries = await getCollection('content');
  const matches = entries
    .map((entry) => ({ entry, meta: parseContentId(entry.id) }))
    .filter((item): item is { entry: SiteContentEntry; meta: ParsedContentId } => Boolean(item.meta))
    .filter(({ meta }) => meta.kind === 'pages' && meta.slug === slug)
    .filter(({ meta }) => currentProfile.content.owners.includes(meta.owner))
    .sort((a, b) => ownerPriority(a.meta.owner) - ownerPriority(b.meta.owner));

  return matches[0]?.entry ?? null;
}
