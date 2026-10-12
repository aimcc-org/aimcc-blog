import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const allowed = new Set([
  "components",
  "modules",
  "utils",
  "stories",
  "styles",
]);
const failures = [];
const utility =
  /^(?:flex|grid|block|inline-flex|hidden|relative|absolute|fixed|size-\d+|[wh]-auto|(?:bg|text|border|outline|shadow)-(?:admin|rc)-|(?:p[xytrbl]?|m[xytrbl]?|gap|rounded|font|leading|tracking)-\d|(?:max|min)-\[|\[&_)/;
const controls = new Set([
  "button",
  "textarea",
  "input",
  "select",
  "details",
  "summary",
  "dialog",
]);
async function visit(directory, isLibrary = false) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(absolute, isLibrary);
      continue;
    }
    const relative = path.relative(root, absolute);
    const owner = path.basename(directory);
    if (isLibrary && !allowed.has(owner))
      failures.push(`${relative}: 文件应放在职责目录中`);
    if (isLibrary && entry.name.endsWith(".stories.tsx") && owner !== "stories")
      failures.push(`${relative}: Stories 必须放在 stories/`);
    if (entry.name.endsWith(".css"))
      failures.push(`${relative}: 组件样式使用结构化 Less`);
    if (!entry.name.endsWith(".tsx")) continue;
    const text = await readFile(absolute, "utf8");
    const source = ts.createSourceFile(
      absolute,
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const primitive = relative.startsWith(
      `src${path.sep}components${path.sep}ui${path.sep}`,
    );
    const strings = (node) => {
      if (
        ts.isStringLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)
      ) {
        if (node.text.split(/\s+/).some((token) => utility.test(token)))
          failures.push(`${relative}: className 应为语义类名，样式放在 Less`);
      } else ts.forEachChild(node, strings);
    };
    const inspect = (node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(source);
        const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
        const value = (name) =>
          attributes.find((attr) => attr.name.getText(source) === name)
            ?.initializer;
        const hidden = attributes.some(
          (attr) => attr.name.getText(source) === "hidden" && !attr.initializer,
        );
        const fileInput =
          tag === "input" && value("type")?.text === "file" && hidden;
        if (!primitive && controls.has(tag) && !fileInput)
          failures.push(
            `${relative}: ${tag} 必须复用共享控件（隐藏文件选择器除外）`,
          );
        const role = value("role")?.text;
        if (!primitive && ["dialog", "tab", "tablist"].includes(role))
          failures.push(`${relative}: ${role} 必须复用 Dialog/Tabs`);
      }
      if (
        ts.isJsxAttribute(node) &&
        ["className", "wrapperClassName"].includes(node.name.getText(source)) &&
        node.initializer
      )
        strings(node.initializer);
      ts.forEachChild(node, inspect);
    };
    inspect(source);
  }
}
await visit(path.join(root, "src/components"), true);
await visit(path.resolve(root, "../../blog-web/src/components"));
for (const manifestPath of ["package.json", "../../blog-web/package.json"]) {
  const manifest = JSON.parse(
    await readFile(path.join(root, manifestPath), "utf8"),
  );
  for (const name of Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
  })) {
    if (/tailwind|@uiw\/react-md-editor/.test(name))
      failures.push(`${manifestPath}: 不应依赖 ${name}`);
  }
}
if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exitCode = 1;
} else console.log("组件目录、控件复用和 Less 规范检查通过");
