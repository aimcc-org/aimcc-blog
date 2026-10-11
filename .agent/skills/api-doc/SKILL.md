# 接口文档 Skill

## 何时使用

修改后端接口（新增/修改/删除 Controller、DTO、VO）后，必须同步更新 `openapi.json`。

## 规则

`openapi.json` 在仓库根目录，用于导入 Apifox。每次改完接口后必须更新，不能等最后一起改。

### 更新方式

**优先方式**：后端启动后自动生成

```bash
curl http://localhost:8080/v3/api-docs > openapi.json
```

**手动方式**：如果不想启动后端，直接编辑 `openapi.json`，在对应 schema 里加字段。

### 检查清单

改了以下内容必须更新 openapi.json：
- 新增/删除/修改 Controller 接口
- 新增/修改 DTO（请求参数）
- 新增/修改 VO（返回字段）
- 修改接口路径或方法

### 禁止

- 不要忘记更新就提交
- 不要手动维护一份单独的接口文档，以 openapi.json 为准
