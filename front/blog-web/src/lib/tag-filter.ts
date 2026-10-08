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

export function toggleTagHref(ids: number[], id: number): string {
  return ids[0] === id ? "/#posts" : `/?tagId=${id}#posts`;
}
