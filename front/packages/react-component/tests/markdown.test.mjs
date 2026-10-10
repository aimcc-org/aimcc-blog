import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MarkdownReader } from "../dist/MarkdownReader.js";
import { MarkdownEditor } from "../dist/MarkdownEditor.js";

const render = (source) =>
  renderToStaticMarkup(createElement(MarkdownReader, { source }));
test("render GFM, code and unique heading anchors", () => {
  const html = render(
    "## 标题\n\n## 标题\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n- [x] done\n\n~~old~~\n\n```js\nconst n = 1;\n```",
  );
  assert.match(html, /id="md-标题"/);
  assert.match(html, /id="md-标题-1"/);
  assert.match(html, /<table>/);
  assert.match(html, /type="checkbox" disabled="" checked=""/);
  assert.match(html, /<del>old<\/del>/);
  assert.match(html, /<pre><code class="language-js">/);
});
test("disable raw HTML and unsafe links while keeping safe images", () => {
  const html = render(
    "<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)\n\n![image](https://example.com/image.png)",
  );
  assert.doesNotMatch(html, /<script|javascript:/);
  assert.match(html, /loading="lazy"/);
});
test("editor SSR does not import DOM or CSS dependencies and uses shared preview", () => {
  const html = renderToStaticMarkup(
    createElement(MarkdownEditor, {
      value: "**preview**",
      onChange() {},
      previewOnly: true,
    }),
  );
  assert.match(html, /aimcc-markdown/);
  assert.match(html, /<strong>preview<\/strong>/);
  assert.doesNotMatch(html, /w-md-editor/);
});
