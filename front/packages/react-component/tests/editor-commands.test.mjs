import assert from "node:assert/strict";
import test from "node:test";
import {
  applyEditorCommand,
  editorCommands,
} from "../dist/components/markdown/utils/editor-commands.js";
const command = (label) => editorCommands.find((item) => item.label === label);

test("format the selected range without replacing adjacent draft content", () => {
  const result = applyEditorCommand("前文文字后文", 2, 4, command("粗体"));
  assert.equal(result.value, "前文**文字**后文");
  assert.equal(
    result.value.slice(result.selectionStart, result.selectionEnd),
    "文字",
  );
});
test("prefix every selected line, preserving following content", () => {
  const result = applyEditorCommand(
    "开头\n第一项\n第二项\n结尾",
    4,
    10,
    command("无序列表"),
  );
  assert.equal(result.value, "开头\n- 第一项\n- 第二项\n结尾");
});
test("insert at the start after a newline without modifying the previous line", () => {
  assert.equal(
    applyEditorCommand("\n正文", 0, 0, command("二级标题")).value,
    "## 标题\n正文",
  );
  assert.equal(
    applyEditorCommand("前文\n正文", 3, 5, command("引用")).value,
    "前文\n> 正文",
  );
});
