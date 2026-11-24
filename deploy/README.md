# deploy —— 服务器上跑的编排

这个目录里的文件**都不在本地运行**，它们是发到服务器后落地的源模板。

## 文件对应关系

| 仓库里的文件 | 落地到哪台机器 | 落地后的路径和文件名 |
|---|---|---|
| `deploy/compose-main.yml` | A 机：阿里云 ECS（杭州），入口 + 数据库 + 全栈 | `/opt/blog-compose/docker-compose.yml` |
| `deploy/compose-worker.yml` | B 机：阿里云轻量（北京），只跑 public 副本 | `/opt/blog-worker/docker-compose.yml` |
| `../docker-compose.yml` | 本地 Mac，开发用 | 不用动，就地执行 |

## 为什么仓库里要改名，落地时必须叫 `docker-compose.yml`

`docker compose` 只会自动查找当前目录里的默认文件名（`compose.yaml` / `compose.yml` / `docker-compose.yaml` / `docker-compose.yml`）。

服务器上如果没有这个名字，每次都得写 `docker compose -f xxx.yml up`，忘一次就执行不到想的文件。

所以约定是：

- **仓库里用有意义的名字区分角色**（main / worker）
- **落地时统一改回 `docker-compose.yml`**，靠目录区分机器

## 同步方式

两台机器都由 CI 自动同步（`.github/workflows/deploy.yml`）：

- **A 机**：`Sync compose file` 把 `deploy/compose-main.yml` 传上去，覆盖 `/opt/blog-compose/docker-compose.yml`
- **B 机**：`Sync worker compose` 把 `deploy/compose-worker.yml` 传上去，覆盖 `/opt/blog-worker/docker-compose.yml`

两边都是「先传临时文件 → 备份旧的 → 替换 → 校验语法」，失败不会破坏正在跑的那份。

手工同步（CI 不可用时）：

```bash
scp deploy/compose-main.yml   root@<A 机 IP>:/opt/blog-compose/docker-compose.yml
scp deploy/compose-worker.yml root@<B 机 IP>:/opt/blog-worker/docker-compose.yml
```

## 改动这份文件时的注意

- 改完先本地校验语法：`docker compose -f deploy/compose-main.yml config -q`
- 改了 A 机的端口映射或数据卷，CI 只会重建 `eureka gateway public admin`，**mysql / redis 需要手动 `docker compose up -d mysql redis`** 才生效
- 数据卷名已在 `compose-main.yml` 末尾写死为 `blog-compose_blog-mysql-data`，改目录名不会挂到空卷
