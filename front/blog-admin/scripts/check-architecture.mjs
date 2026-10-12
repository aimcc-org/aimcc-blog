import { readdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const src = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
const errors = [];
function layerOf(path) {
  for (const kind of ["hooks", "utils", "types"])
    if (path.includes(`/${kind}/`)) return kind;
  return path.split("/")[0];
}
const allowed = {
  utils: new Set(["utils", "types", "config.ts", "config"]),
  services: new Set(["services", "utils", "types", "config.ts", "config"]),
  hooks: new Set([
    "hooks",
    "services",
    "utils",
    "types",
    "config.ts",
    "config",
  ]),
  components: new Set(["components", "utils", "types", "config.ts", "config"]),
  layout: new Set(["layout", "utils", "types", "config.ts", "config"]),
};
function visitDir(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      visitDir(path);
      continue;
    }
    if (!/\.tsx?$/.test(path)) continue;
    const name = relative(src, path);
    const layer = layerOf(name);
    const parts = name.split("/");
    if (
      name.endsWith(".tsx") &&
      ["layout", "pages", "components"].includes(parts[0]) &&
      !["components", "demos"].includes(parts.at(-2))
    )
      errors.push(
        `${name}: 组件实现与演示应放在组件目录下的 components/ 或 demos/ 中`,
      );
    const code = readFileSync(path, "utf8");
    if (code.trimEnd().split("\n").length > 250)
      errors.push(`${name}: 超过 250 行，请按职责拆分`);
    const ast = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true);
    function walk(node) {
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const specifier = node.moduleSpecifier.text;
        const bindings = node.importClause?.namedBindings;
        if (
          specifier === "antd" &&
          bindings &&
          ts.isNamedImports(bindings) &&
          bindings.elements.some(
            (item) => (item.propertyName ?? item.name).text === "Layout",
          ) &&
          layer !== "layout"
        )
          errors.push(`${name}: Ant Design Layout 只能在 layout/ 中使用`);
        const typeOnly =
          node.importClause?.isTypeOnly ||
          (bindings &&
            ts.isNamedImports(bindings) &&
            bindings.elements.every((item) => item.isTypeOnly));
        if (
          !typeOnly &&
          (specifier.startsWith("@/") || specifier.startsWith("."))
        ) {
          const target = specifier.startsWith("@/")
            ? specifier.slice(2)
            : relative(src, resolve(dirname(path), specifier));
          if (allowed[layer] && !allowed[layer].has(layerOf(target)))
            errors.push(`${name}: ${layer} 不能依赖 ${target}`);
        }
      }
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "fetch" &&
        name !== "services/request.ts"
      )
        errors.push(`${name}: HTTP 请求必须经 services/request.ts`);
      ts.forEachChild(node, walk);
    }
    walk(ast);
  }
}
visitDir(src);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  "架构检查通过：布局集中、组件归类、依赖分层、请求封装、单文件不超过 250 行",
);
