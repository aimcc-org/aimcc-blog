export function coverText(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "placehold.co"
      ? (url.searchParams.get("text") ?? "")
      : "";
  } catch {
    return "";
  }
}
