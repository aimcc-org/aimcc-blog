import assert from "node:assert/strict";
import test from "node:test";
import {
  readTagIds,
  toggleTagHref,
  readCategoryId,
  toggleCategoryHref,
} from "../src/lib/tag-filter.ts";

test("read one tag even from older multi-tag URLs", () => {
  assert.deepEqual(readTagIds("?tagId=2"), [2]);
  assert.deepEqual(readTagIds("?tagId=2&tagId=1&tagId=2"), [2]);
  assert.deepEqual(readTagIds("?tagId=4,2"), [4]);
});

test("category selects, replaces and cancels while preserving the tag", () => {
  assert.equal(readCategoryId("?categoryId=3&tagId=2"), 3);
  assert.equal(readCategoryId("?categoryId=bad"), undefined);
  assert.equal(
    toggleCategoryHref(undefined, 3, [2]),
    "/?tagId=2&categoryId=3#posts",
  );
  assert.equal(toggleCategoryHref(3, 4, [2]), "/?tagId=2&categoryId=4#posts");
  assert.equal(toggleCategoryHref(3, 3, [2]), "/?tagId=2#posts");
  assert.equal(toggleCategoryHref(3, 3), "/#posts");
  assert.equal(toggleTagHref([2], 2, 3), "/?categoryId=3#posts");
  assert.equal(toggleTagHref([2], 1, 3), "/?tagId=1&categoryId=3#posts");
});
test("ignore absent and malformed IDs", () => {
  for (const search of [
    "",
    "?tag=Java",
    "?tagId=",
    "?tagId=0",
    "?tagId=-1",
    "?tagId=1.5",
    "?tagId=abc",
    "?tagId=9007199254740993",
  ]) {
    assert.deepEqual(readTagIds(search), []);
  }
  assert.deepEqual(readTagIds("?tagId=abc&tagId=2"), [2]);
});
test("select, replace and cancel a single tag", () => {
  assert.equal(toggleTagHref([], 2), "/?tagId=2#posts");
  assert.equal(toggleTagHref([2], 1), "/?tagId=1#posts");
  assert.equal(toggleTagHref([2], 2), "/#posts");
  assert.equal(toggleTagHref([1], 1), "/#posts");
});
