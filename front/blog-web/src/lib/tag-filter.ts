/** Single selection: older multi-tag URLs use their first valid ID. */
export function readTagIds(search: string): number[] {
  const values = new URLSearchParams(search)
    .getAll("tagId")
    .flatMap((value) => value.split(","));
  return [
    ...new Set(
      values
        .filter((value) => /^[1-9]\d*$/.test(value))
        .map(Number)
        .filter(Number.isSafeInteger),
    ),
  ].slice(0, 1);
}

export function readCategoryId(search: string): number | undefined {
  const value = new URLSearchParams(search).get("categoryId");
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : undefined;
}

function filterHref(tagId?: number, categoryId?: number): string {
  const params = new URLSearchParams();
  if (tagId !== undefined) params.set("tagId", String(tagId));
  if (categoryId !== undefined) params.set("categoryId", String(categoryId));
  return `/${params.size ? `?${params}` : ""}#posts`;
}

export function toggleTagHref(
  ids: number[],
  id: number,
  categoryId?: number,
): string {
  return filterHref(ids[0] === id ? undefined : id, categoryId);
}

export function toggleCategoryHref(
  current: number | undefined,
  id: number,
  tagIds: number[] = [],
): string {
  return filterHref(tagIds[0], current === id ? undefined : id);
}
