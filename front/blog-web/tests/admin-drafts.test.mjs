import assert from "node:assert/strict";
import test from "node:test";
import { createDraft, readDraftStore } from "../src/lib/admin-drafts.ts";

test("HTTP development can create and restore drafts without crypto.randomUUID", () => {
  const descriptor = Object.getOwnPropertyDescriptor(crypto, "randomUUID");
  Object.defineProperty(crypto, "randomUUID", {
    value: undefined,
    configurable: true,
  });
  try {
    const store = readDraftStore(null, null);
    assert.equal(store.drafts.length, 1);
    assert.equal(store.activeId, store.drafts[0].id);
    assert.match(
      store.activeId,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    assert.notEqual(createDraft().id, store.activeId);
    assert.deepEqual(readDraftStore(JSON.stringify(store), null), store);
  } finally {
    if (descriptor) Object.defineProperty(crypto, "randomUUID", descriptor);
    else delete crypto.randomUUID;
  }
});
