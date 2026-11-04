# Server

Spring Boot 4.1.1 + JDK 25 + MyBatis-Plus + MySQL + Flyway + Sa-Token + Redis

## 本地启动

需要环境变量：
- `DB_PASSWORD`：MySQL 密码
- `REDIS_PASSWORD`：Redis 密码

```bash
./mvnw spring-boot:run
```

## 打包部署

```bash
./mvnw clean package -DskipTests
scp target/server-0.0.1-SNAPSHOT.jar root@47.96.92.202:/opt/blog/blog.jar
ssh root@47.96.92.202 "systemctl restart blog"
```

## 服务器部署配置

服务用 systemd 管理，配置文件在 `/etc/systemd/system/blog.service`：

- 以 `blogapp` 低权限用户运行（不用 root）
- 环境变量 `DB_USERNAME`、`DB_PASSWORD`、`REDIS_PASSWORD` 写在 service 文件里
- JVM 限制 `-Xmx256m`（1G 小内存服务器）
- 崩溃自动重启（`Restart=always`，等 5 秒）
- 开机自启（`WantedBy=multi-user.target`）

## Nginx 反向代理

Nginx 配置在 `/etc/nginx/sites-available/blog`：
- 静态文件托管：前端构建产物放在 `/var/www/blog/`
- `/api/` 开头的请求反向代理到 `127.0.0.1:8080`（后端 Spring Boot）

## 服务器排障

```bash
systemctl status blog --no-pager        # 服务状态（看 active/running）
journalctl -u blog -n 50 --no-pager    # 看最近 50 行日志
journalctl -u blog -f                  # 实时日志
curl http://localhost:8080/api/articles  # 本机自测接口
```

## 目录结构

```
server/
├── mvnw              # Maven 构建脚本（Mac/Linux 用）
├── mvnw.cmd          # Maven 构建脚本（Windows 用）
├── pom.xml           # 依赖配置文件
├── .gitignore        # Git 忽略配置（不用管）
├── .gitattributes    # 换行符自动处理（不用管）
└── src/main/java/com/aimcc/blog/
    ├── controller/    # 接口入口
    ├── service/       # 业务逻辑（接口 + 实现类）
    ├── mapper/        # 数据库操作
    ├── entity/        # 数据库表对应实体类
    ├── dto/           # 请求参数和返回数据
    ├── common/        # 统一返回格式、工具类
    ├── exception/     # 全局异常处理
    ├── config/        # 配置类
    └── ServerApplication.java  # 启动入口
```
