import assert from "node:assert/strict";
import test from "node:test";
import { groupArticlesByDay } from "../dist/ArticleTimeline.js";

const article = (id, publishedAt) => ({ id, title: `文章 ${id}`, publishedAt });
test("group unsorted articles by Beijing day and order latest first", () => {
  const input = [
    article(1, "2026-10-07T12:00:00+08:00"),
    article(2, "2026-10-07T17:00:00Z"),
    article(3, "2026-10-08T08:00:00+08:00"),
  ];
  const result = groupArticlesByDay(input);
  assert.deepEqual(
    result.map((group) => [group.date, group.articles.map((item) => item.id)]),
    [
      ["2026-10-08", [3, 2]],
      ["2026-10-07", [1]],
    ],
  );
  assert.equal(input[0].id, 1);
});
test("merge articles across pages, deduplicate ids, and retain civil dates", () => {
  const result = groupArticlesByDay([
    article(1, "2026-10-08T12:00:00"),
    article(2, "2026-10-08"),
    article(1, "2026-10-08T12:00:00"),
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].date, "2026-10-08");
  assert.equal(result[0].articles.length, 2);
});
test("respect explicit timezone and ignore invalid dates", () => {
  const result = groupArticlesByDay(
    [
      article(1, "2026-10-07T17:00:00Z"),
      article(2, "invalid"),
      article(3, "2026-02-30"),
    ],
    "UTC",
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].date, "2026-10-07");
  assert.deepEqual(
    result[0].articles.map((item) => item.id),
    [1],
  );
  assert.deepEqual(groupArticlesByDay([]), []);
});
